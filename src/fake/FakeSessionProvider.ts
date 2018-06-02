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

	getWindow(id: number): BT.Window | undefined {
		return this.session.windows.find(w => w.id === id);
	}

	getTab(id: number): BT.Tab | undefined {
		return (this.session.windows.find(w => w.tabs.some(t => t.id === id)) || BT.NullWindow).tabs.find(t => t.id === id);
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

	hookBrowserEvents() {
		console.log(`FakeSessionProvider.hookBrowserEvents`);
	}
	unhookBrowserEvents() {
		console.log(`FakeSessionProvider.unhookBrowserEvents`);
	}

}