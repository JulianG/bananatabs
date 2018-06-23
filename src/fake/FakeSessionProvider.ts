import * as BT from '../model/CoreTypes';
import SessionProvider from '../model/SessionProvider';
import SessionPersistence from '../model/SessionPersistence';

export default class FakeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	constructor(private persistence: SessionPersistence) {
		console.warn('FakeSessionProvider');
		this.session = BT.EmptySession;
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
		console.log(`FakeSessionProvider.initialiseSession. reason ${reason}...`);
		this.session = await this.persistence.retrieveSession();
		this.onSessionChanged(this.session);
	}

	async updateSession(reason?: string) {
		console.log(`FakeSessionProvider.updateSession. reason ${reason}...`);
		this.onSessionChanged(this.session);
	}

	async storeSession(session: BT.Session) {
		console.log(`FakeSessionProvider.storeSession`);
		this.persistence.storeSession(session);
	}

}