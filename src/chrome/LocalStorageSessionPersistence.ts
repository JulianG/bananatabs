import * as BT from '../model/core/CoreTypes';
import { SessionPersistence } from '../model/core/SessionPersistence';

import { convertLegacySession } from '../serialisation/JSONSerialisation';

export class LocalStorageSessionPersistence implements SessionPersistence {
  storeSession(session: BT.Session) {
    const serialisedSession = JSON.stringify(session);
    localStorage.setItem('session', serialisedSession);
    return Promise.resolve();
  }

  retrieveSession(): Promise<BT.Session> {
    return new Promise((resolve, reject) => {
      const serialisedSession: string =
        localStorage.getItem('session') || 'null';
      try {
        const session =
          convertLegacySession(JSON.parse(serialisedSession)) ||
          BT.EmptySession;
        resolve(session);
      } catch (e) {
        resolve(BT.EmptySession);
      }
    });
  }
}
