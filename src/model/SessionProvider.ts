import * as BT from './core/CoreTypes';

export interface SessionProvider {
  session: BT.Session;
  onSessionChanged(session: BT.Session): void;
  initialiseSession(): Promise<void>;
  updateSession(): Promise<void>;
  setSession(session: BT.Session): void;
  setSessionNoDispatch(session: BT.Session): void;
}
