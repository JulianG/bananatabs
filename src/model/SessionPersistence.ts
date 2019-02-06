import * as BT from './core/CoreTypes';

export interface SessionPersistence {
  storeSession(session: BT.Session): Promise<void>;
  retrieveSession(): Promise<BT.Session>;
}
