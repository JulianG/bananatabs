import * as BT from '../model/CoreTypes';
import SessionProvider from '../model/SessionProvider';

export default class FakeSessionProvider implements SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	constructor() {
		this.session = BT.EmptySession;
	}
	
	initialiseSession(reason?: string): void {
		console.log(`FakeSessionProvider.initialiseSession. reason ${reason}...`);
		const onSessionChanged = this.onSessionChanged;
		const retrieveSession = this.retrieveSession;
		this.session = this.retrieveSession();
		setTimeout(() => onSessionChanged(retrieveSession()), 125);
	}

	storeSession(session: BT.Session) {
		const serialisedSession = JSON.stringify(session);
		localStorage.setItem('session', serialisedSession);
	}

	private retrieveSession(): BT.Session {
		const serialisedSession: string = localStorage.getItem('session') || 'null';
		return JSON.parse(serialisedSession) || BT.EmptySession;
	}
}