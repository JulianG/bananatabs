import * as BT from './CoreTypes';

export default interface SessionPersistence {
  storeSession(session: BT.Session): Promise<void>;
  retrieveSession(): Promise<BT.Session>;
}
