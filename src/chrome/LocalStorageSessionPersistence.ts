import * as BT from '../model/CoreTypes';
import SessionPersistence from '../model/SessionPersistence';
import * as Logging from '../utils/Logging';

export default class LocalStorageSessionPersistence implements SessionPersistence {

	storeSession(session: BT.Session) {
		const serialisedSession = JSON.stringify(session);
		
		console.log('LocalStorageSessionPersistence.storeSession:');
		Logging.printSession(session);
		
		localStorage.setItem('session', serialisedSession);
		return Promise.resolve({});
	}

	retrieveSession(): Promise<BT.Session> {
		return new Promise((resolve, reject) => {
			const serialisedSession: string = localStorage.getItem('session') || 'null';
			try {
				const session = JSON.parse(serialisedSession) || BT.EmptySession;
				resolve(session);
			} catch (e) {
				resolve(BT.EmptySession);
			}
		});
	}
}