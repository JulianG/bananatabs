import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';
import SessionProvider from '../model/SessionProvider';
import LiveSessionMerger from '../model/mergers/LiveSessionMerger';
import SessionPersistence from '../model/SessionPersistence';
import console from '../utils/MutedConsole';

export default class ChromeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;
	private busy: boolean;

	constructor(
		private browserController: BrowserController,
		private sessionMerger: LiveSessionMerger,
		private persistence: SessionPersistence
	) {
		this.session = BT.EmptySession;
		this._updateSession = this._updateSession.bind(this);
		this.browserController.addEventListener(this.handleBrowserEvent.bind(this));
		this.busy = false;
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
		if (!this.busy) {
			this.busy = true;
			console.log(`SessionProvider.initialiseSession ... because ${reason}.`);
			console.log(`  getting session from disk...`);
			const retrievedSession = await this.persistence.retrieveSession();
			console.log(`  getting session from browser...`);
			const liveSession = await this.getChromeSession();
			console.log(`  done. now merging sessions`);
			this.session = this.mergeSessions(retrievedSession, liveSession, reason);
			console.log(`  done. now storing session`);
			await this.storeSession(this.session);
			console.log(`  done. now...`);
			console.log(`SessionProvider.initialiseSession calling onSessionChanged beacuse: ${reason}`);
			this.onSessionChanged(this.session);
			this.busy = false;
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

	// enableBrowserEvents() {
	// 	this.busy = false;
	// }

	// disableBrowserEvents() {
	// 	this.busy = true;
	// }

	//////////////////////////

	private handleBrowserEvent(event: string, reason?: string) {
		if (!this.busy) {
			console.log(`handleBrowserEvent: ${event} because ${reason}`);
			this.updateSession(reason);
		} else {
			console.warn(`not handling browser event: ${event} because I was busy! (Actually ${reason})`);
		}
	}

	private async _updateSession(reason?: string) {
		if (!this.busy) {
			this.busy = true;
			console.log(`SessionProvider._updateSession because ${reason}.`);
			const liveSession = await this.getChromeSession();
			this.session = this.mergeSessions(this.session, liveSession, reason);
			await this.storeSession(this.session);
			this.busy = false;
		}
	}

	private async getChromeSession(): Promise<BT.Session> {
		const sessionWindows: BT.Window[] = await this.browserController.getAllWindows();
		const panelWindow = this.findChromeExtensionWindow(sessionWindows) || BT.NullWindow;
		const filteredSessionWindows = sessionWindows.filter(w => w !== panelWindow);
		return { windows: filteredSessionWindows, panelWindow };
	}

	private mergeSessions(retrievedSession: BT.Session, liveSession: BT.Session, reason?: string) {
		console.log(`  Merging sessions because ${reason}...`);
		const session = this.sessionMerger.merge(liveSession, retrievedSession);
		return session;
	}

	private findChromeExtensionWindow(windows: BT.Window[]): BT.Window | undefined {
		return windows.find(w => {
			return (w.tabs.some(t => t.url === window.location.toString()));
		});
	}

}