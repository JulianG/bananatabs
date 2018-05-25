import * as BT from '../model/CoreTypes';
import SessionProvider from '../model/SessionProvider';
import SessionPersistence from '../model/SessionPersistence';

export default class FakeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	constructor(private persistence: SessionPersistence) {
		this.session = BT.EmptySession;
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

	async updateSessionSilently(reason?: string) {
		console.log(`FakeSessionProvider.updateSessionSilently. reason ${reason}...`);
	}

	async storeSession(session: BT.Session) {
		console.log(`FakeSessionProvider.storeSession`);
		this.persistence.storeSession(session);
	}

}