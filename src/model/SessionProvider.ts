import * as BT from './CoreTypes';

export default interface SessionProvider {
  session: BT.Session;
  onSessionChanged(session: BT.Session): void;
  initialiseSession(): Promise<void>;
  updateSession(): Promise<void>;
  storeSession(session: BT.Session): Promise<void>;

  getWindow(id: number): BT.Window;
  getTab(id: number): BT.Tab;
}
