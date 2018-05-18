import * as BT from './CoreTypes';

export default interface SessionProvider {
	session: BT.Session;
	onSessionChanged(session: BT.Session): void;
	initialiseSession(reason?: string): void;
	storeSession(session: BT.Session): void;
}