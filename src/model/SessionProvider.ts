import * as BT from './CoreTypes';

export default interface SessionProvider {
  session: BT.Session;
  onSessionChanged(session: BT.Session): void;
  initialiseSession(): Promise<void>;
  updateSession(): Promise<void>;
  setSession(session: BT.Session): void;
  setSessionNoDispatch(session: BT.Session): void;
}
