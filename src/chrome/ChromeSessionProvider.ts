import * as BT from '../model/CoreTypes';
import SessionProvider from '../model/SessionProvider';
import SessionMerger from '../model/SessionMerger';
import SessionPersistence from '../model/SessionPersistence';

import MutedConsole from '../utils/MutedConsole';
const console = new MutedConsole();

export default class ChromeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	constructor(private sessionMerger: SessionMerger, private persistence: SessionPersistence) {
		this.session = BT.EmptySession;

		this.initialiseSession = this.initialiseSession.bind(this);
		this.onWindowRemoved = this.onWindowRemoved.bind(this);
		this.onTabsCreated = this.onTabsCreated.bind(this);
		this.onTabsUpdated = this.onTabsUpdated.bind(this);
		this.onTabsMoved = this.onTabsMoved.bind(this);
		this.onTabsAttached = this.onTabsAttached.bind(this);
		this.onTabsRemoved = this.onTabsRemoved.bind(this);

		this.convertWindow = this.convertWindow.bind(this);
		this.convertTab = this.convertTab.bind(this);

		if (chrome && chrome.tabs) {
			chrome.windows.onRemoved.addListener(this.onWindowRemoved);
			chrome.tabs.onCreated.addListener(this.onTabsCreated);
			chrome.tabs.onUpdated.addListener(this.onTabsUpdated);
			// chrome.tabs.onActivated.addListener(this.initialiseSession);
			chrome.tabs.onMoved.addListener(this.onTabsMoved);
			// chrome.tabs.onHighlighted.addListener(this.initialiseSession);
			// chrome.tabs.onDetached.addListener(this.initialiseSession);
			chrome.tabs.onAttached.addListener(this.onTabsAttached);
			chrome.tabs.onRemoved.addListener(this.onTabsRemoved);
			// chrome.tabs.onReplaced.addListener(this.initialiseSession);
		}
	}

	async initialiseSession(reason?: string) {

		console.log(`SessionProvider.initialiseSession because ${reason}. calling chrome.windows.getAll...`);
		const retrievedSession = await this.persistence.retrieveSession();
		console.log(`... retrieved session`);
		const liveSession = await this.getChromeSession();
		console.log(`... got chrome live session`);
		this.mergeSessions(retrievedSession, liveSession, reason);
	}

	storeSession(session: BT.Session) {
		this.persistence.storeSession(session);
	}

	//////////////////////////

	private getChromeSession(): Promise<BT.Session> {
		return new Promise<BT.Session>((resolve, reject) => {
			chrome.windows.getAll({ populate: true }, (windows: Array<chrome.windows.Window>) => {

				const windowsWithTabs = windows.filter(w => (w.tabs || []).length > 0 && w.incognito === false);
				const sessionWindows: BT.Window[] = windowsWithTabs.map(this.convertWindow);
				const panelWindow = this.findChromeExtensionWindow(sessionWindows) || BT.NullWindow;
				const filteredSessionWindows = sessionWindows.filter(w => w !== panelWindow);
				resolve({
					windows: filteredSessionWindows,
					panelWindow
				});
			});
		});
	}

	private mergeSessions(retrievedSession: BT.Session, liveSession: BT.Session, reason?: string) {

		console.groupCollapsed(`  Merging sessions because ${reason}...`);
		console.log('live-session:');
		console.log(JSON.stringify(liveSession));
		console.log('stored-session:');
		console.log(JSON.stringify(retrievedSession));
		this.session = this.sessionMerger.mergeSessions(liveSession, retrievedSession);
		console.log('merged-session:');
		console.log(JSON.stringify(this.session));
		console.groupEnd();

		this.storeSession(this.session);
		this.onSessionChanged(this.session);
	}

	private convertWindow(w: chrome.windows.Window): BT.Window {

		return {
			id: w.id,
			title: '',
			visible: true,
			icon: '',
			tabs: (w.tabs || []).filter(t => t.incognito === false).map(this.convertTab),
			focused: w.focused || false,
			type: w.type,
			state: w.state,
			geometry: this.getWindowGeometry(w),
			expanded: true
		};
	}

	private convertTab(t: chrome.tabs.Tab, i: number): BT.Tab {
		return {
			id: t.id || -1,
			title: t.title || '',
			visible: true,
			icon: t.favIconUrl || '',
			index: t.index,
			listIndex: i,
			url: t.url || '',
			active: t.active
		};
	}

	private findChromeExtensionWindow(windows: BT.Window[]): BT.Window | undefined {
		return windows.find(w => {
			return (w.tabs.some(t => t.url === chrome.extension.getURL('index.html')));
		});
	}

	private getWindowGeometry(w: chrome.windows.Window): BT.Geometry {
		return { top: w.top || 0, left: w.left || 0, width: w.width || 0, height: w.height || 0 };
	}

	private onWindowRemoved(id: number) {
		this.initialiseSession('onWindowRemoved ' + id);
	}

	private onTabsCreated(tab: chrome.tabs.Tab) {
		console.log(`NOT MERGING -- onTabsCreated ${JSON.stringify(tab, null, 2)}`);
	}

	private onTabsUpdated(id: number, changeInfo: chrome.tabs.TabChangeInfo) {
		if (this.isPanelTab(id) === false && changeInfo.status === 'complete') {
			this.initialiseSession(`onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`);
		} else {
			console.log(`NOT MERGING -- onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`);
		}
	}

	private onTabsMoved(id: number, moveInfo: chrome.tabs.TabMoveInfo) {
		if (this.isPanelTab(id) === false) {
			this.initialiseSession('onTabsMoved');
		}
	}

	private onTabsAttached(id: number, info: chrome.tabs.TabAttachInfo) {
		this.initialiseSession('onTabsAttached');
	}

	private onTabsRemoved(id: number, removedInfo: chrome.tabs.TabRemoveInfo) {
		if (this.isPanelTab(id) === false && removedInfo.isWindowClosing === false) {
			this.initialiseSession(`onTabsRemoved - ${id} - ${JSON.stringify(removedInfo)}`);
		}
	}

	private isPanelTab(id: number): boolean {
		return (id === this.session.panelWindow.tabs[0].id);
	}

}