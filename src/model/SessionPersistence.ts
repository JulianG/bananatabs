import * as BT from './core/CoreTypes';

export default interface SessionPersistence {
  storeSession(session: BT.Session): Promise<void>;
  retrieveSession(): Promise<BT.Session>;
}
