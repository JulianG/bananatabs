import * as BT from '../model/CoreTypes';
import SessionPersistence from '../model/SessionPersistence';

export default class RAMSessionPersistence implements SessionPersistence {

	constructor(private session: BT.Session = BT.EmptySession) {
		this.storeSession(session);
	}

	async storeSession(session: BT.Session): Promise<{}> {
		this.session = { ...session };
		return {};
	}

	async retrieveSession(): Promise<BT.Session> {
		return this.session;
	}

}
