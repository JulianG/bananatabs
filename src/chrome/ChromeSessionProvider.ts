import * as BT from '../model/CoreTypes';
import SessionProvider from '../model/SessionProvider';
import SessionMerger from '../model/SessionMerger';
import SessionPersistence from '../model/SessionPersistence';
import ChromeEventHandler from './ChromeEventHandler';
import console from '../utils/MutedConsole';

export default class ChromeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	private chromeEventHandler: ChromeEventHandler;

	constructor(private sessionMerger: SessionMerger, private persistence: SessionPersistence) {
		this.session = BT.EmptySession;

		this._updateSession = this._updateSession.bind(this);

		this.convertWindow = this.convertWindow.bind(this);
		this.convertTab = this.convertTab.bind(this);

		this.chromeEventHandler = new ChromeEventHandler(this);
		this.chromeEventHandler.enable();
		
	}

	getWindow(id: number): BT.Window {
		const win = this.session.windows.find(w => w.id === id);
		console.assert(win !== undefined, `Could not find a window with id ${id} in the current session.`);
		return win || { ...BT.NullWindow, id };
	}

	getTab(id: number): BT.Tab {
		const win = (this.session.windows.find(w => w.tabs.some(t => t.id === id)) || BT.NullWindow);
		const tab = win.tabs.find(t => t.id === id);
		console.assert(tab !== undefined, `Could not find a tab with id ${id} in the current session.`);
		return tab || { ...BT.NullTab, id };
	}

	async initialiseSession(reason?: string) {
		if (this.chromeEventHandler.isEnabled()) {
			this.chromeEventHandler.disable();
			console.log(`SessionProvider.initialiseSession ... because ${reason}.`);
			console.log(`  getting session from disk...`);
			const retrievedSession = await this.persistence.retrieveSession();
			console.log(`  getting session from chrome.windows.getAll...`);
			const liveSession = await this.getChromeSession();
			console.log(`  done. now merging sessions`);
			this.session = this.mergeSessions(retrievedSession, liveSession, reason);
			console.log(`  done. now storing session`);
			await this.storeSession(this.session);
			console.log(`  done. now...`);
			console.log(`SessionProvider.initialiseSession calling onSessionChanged beacuse: ${reason}`);
			this.onSessionChanged(this.session);
			this.chromeEventHandler.enable();
		}
	}

	async updateSession(reason?: string) {
		console.log(`SessionProvider.updateSession ... beacuse: ${reason}`);
		await this._updateSession(reason);
		console.log(`SessionProvider.updateSession calling onSessionChanged beacuse: ${reason}`);
		this.onSessionChanged(this.session);
	}

	async storeSession(session: BT.Session) {
		await this.persistence.storeSession(session);
	}

	enableBrowserEvents() {
		this.chromeEventHandler.enable();
	}

	disableBrowserEvents() {
		this.chromeEventHandler.disable();
	}

	//////////////////////////

	private async _updateSession(reason?: string) {
		if (this.chromeEventHandler.isEnabled()) {
			this.chromeEventHandler.disable();
			console.log(`SessionProvider._updateSession because ${reason}.`);
			const liveSession = await this.getChromeSession();
			this.session = this.mergeSessions(this.session, liveSession, reason);
			await this.storeSession(this.session);
			this.chromeEventHandler.enable();
		}
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
		console.log(`  Merging sessions because ${reason}...`);
		const session = this.sessionMerger.mergeLiveAndStored(liveSession, retrievedSession);
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

}