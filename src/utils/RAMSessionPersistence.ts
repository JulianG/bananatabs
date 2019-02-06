import * as BT from '../model/core/CoreTypes';
import { SessionPersistence } from '../model/SessionPersistence';

export class RAMSessionPersistence implements SessionPersistence {
  constructor(private session: BT.Session = BT.EmptySession) {
    this.storeSession(session);
  }

  async storeSession(session: BT.Session) {
    this.session = BT.cloneSession(session);
  }

  async retrieveSession(): Promise<BT.Session> {
    return this.session;
  }
}
