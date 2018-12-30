import * as BT from './CoreTypes';

export default interface SessionPersistence {
  storeSession(session: BT.Session): Promise<{}>;
  retrieveSession(): Promise<BT.Session>;
}
