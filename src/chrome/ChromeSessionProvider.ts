import * as BT from '../model/CoreTypes';
import SessionProvider from '../model/SessionProvider';
import SessionMerger from '../model/SessionMerger';
import SessionPersistence from '../model/SessionPersistence';

// import MutedConsole from '../utils/MutedConsole';
// const console = new MutedConsole();

const printSession = (session: BT.Session) => {
	console.log(
		session.windows.map(w => `${w.id}: visible: ${w.visible}, tabs:${w.tabs.length}, `)
	);
};

export default class ChromeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	private chromeEventsEnabled: boolean = true;

	constructor(private sessionMerger: SessionMerger, private persistence: SessionPersistence) {
		this.session = BT.EmptySession;

		this._updateSession = this._updateSession.bind(this);

		this.convertWindow = this.convertWindow.bind(this);
		this.convertTab = this.convertTab.bind(this);

		if (chrome && chrome.tabs) {
			chrome.windows.onRemoved.addListener((id) => this.initialiseSession(`onWindowRemoved ${id}`));
			chrome.windows.onFocusChanged.addListener((_) => this._updateSession('onFocusChanged'));
			chrome.tabs.onCreated.addListener((tab) => this.updateSession(`onTabsCreated ${tab.id}`));
			chrome.tabs.onUpdated.addListener(this.onTabsUpdated.bind(this));
			chrome.tabs.onMoved.addListener(this.onTabsMoved.bind(this));
			chrome.tabs.onAttached.addListener((id, info) => this.updateSession('onTabsAttached'));
			chrome.tabs.onRemoved.addListener(this.onTabsRemoved.bind(this));
			chrome.tabs.onActivated.addListener((_) => this.updateSession('onActivated'));
			// chrome.tabs.onHighlighted.addListener((_) => this.updateSessionSilently('onHighlighted'));
			// chrome.tabs.onDetached.addListener((_) => this.updateSessionSilently('onDetached'));
			// chrome.tabs.onReplaced.addListener((_) => this.updateSessionSilently('onReplaced'));
		}
	}

	getWindow(id: number): BT.Window | undefined {
		return this.session.windows.find(w => w.id === id);
	}

	async initialiseSession(reason?: string) {
		this.safeMode(async () => {
			this.unhookBrowserEvents();
			console.log(`SessionProvider.initialiseSession because ${reason}.
			getting sessions from disk and chrome.windows.getAll...`);
			const retrievedSession = await this.persistence.retrieveSession();
			const liveSession = await this.getChromeSession();
			this.session = this.mergeSessions(retrievedSession, liveSession, reason);
			await this.storeSession(this.session);
			console.log(`SessionProvider calling onSessionChanged`);
			this.onSessionChanged(this.session);
			this.hookBrowserEvents();
		});
	}

	async updateSession(reason?: string) {
		console.log(`SessionProvider.updateSession because ${reason}.`);
		console.log(`  calling only chrome.windows.getAll...`);
		await this._updateSession(reason);
		console.log(`SessionProvider calling onSessionChanged`);
		this.onSessionChanged(this.session);
	}

	async storeSession(session: BT.Session) {
		console.log(`storeSession: before...`);
		await this.persistence.storeSession(session);
		console.log(`storeSession: after...`);
	}

	hookBrowserEvents() {
		console.warn('ChromeSessionProvider.chromeEventsEnabled = true');
		this.chromeEventsEnabled = true;
	}

	unhookBrowserEvents() {
		console.warn('ChromeSessionProvider.chromeEventsEnabled = false');
		this.chromeEventsEnabled = false;
	}

	//////////////////////////

	private async _updateSession(reason?: string) {
		this.safeMode(async () => {
			console.log(`SessionProvider.updateSessionSilently because ${reason}.`);
			const liveSession = await this.getChromeSession();
			this.session = this.mergeSessions(this.session, liveSession, reason);
			await this.storeSession(this.session);
		});
	}


	private getChromeSession(): Promise<BT.Session> {
		console.log('chrome.windows.getAll...');
		return new Promise<BT.Session>((resolve, reject) => {
			chrome.windows.getAll({ populate: true }, (windows: Array<chrome.windows.Window>) => {
				console.log('getChromeSession... retrieved!');
				const windowsWithTabs = windows.filter(w => (w.tabs || []).length > 0 && w.incognito === false);
				const sessionWindows: BT.Window[] = windowsWithTabs.map(this.convertWindow);
				const panelWindow = this.findChromeExtensionWindow(sessionWindows) || BT.NullWindow;
				const filteredSessionWindows = sessionWindows.filter(w => w !== panelWindow);
				console.log('getChromeSession... resolving...');
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
		printSession(liveSession); // console.log(JSON.stringify(liveSession));
		console.log('stored-session:');
		printSession(retrievedSession); // console.log(JSON.stringify(retrievedSession));
		const session = this.sessionMerger.mergeSessions(liveSession, retrievedSession);
		printSession(session); // console.log('merged-session:');
		console.log(JSON.stringify(session));
		console.groupEnd();
		return session;
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

	private onTabsUpdated(id: number, changeInfo: chrome.tabs.TabChangeInfo) {
		if (this.isPanelTab(id) === false && changeInfo.status === 'complete') {
			this.updateSession(`onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`);
		} else {
			console.log(`NOT MERGING -- onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`);
		}
	}

	private onTabsMoved(id: number, moveInfo: chrome.tabs.TabMoveInfo) {
		if (this.isPanelTab(id) === false) {
			this.updateSession('onTabsMoved');
		}
	}

	private onTabsRemoved(id: number, removedInfo: chrome.tabs.TabRemoveInfo) {
		if (this.isPanelTab(id) === false && removedInfo.isWindowClosing === false) {
			this.updateSession(`onTabsRemoved - ${id} - ${JSON.stringify(removedInfo)}`);
		}
	}

	private isPanelTab(id: number): boolean {
		return (id === this.session.panelWindow.tabs[0].id);
	}

	private async safeMode(f: () => void) {
		if (this.chromeEventsEnabled) {
			console.log('ChromeSessionProvider.safeMode start.');
			this.unhookBrowserEvents();
			await f();
			this.hookBrowserEvents();
			console.log('ChromeSessionProvider.safeMode end.');
		}
	}

}