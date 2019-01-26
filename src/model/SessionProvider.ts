import * as BT from './CoreTypes';

export default interface SessionProvider {
  session: BT.Session;
  onSessionChanged(session: BT.Session): void;
  initialiseSession(): Promise<void>;
  updateSession(session?: BT.Session): Promise<void>;
}
