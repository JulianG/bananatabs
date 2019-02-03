import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';
import SessionProvider from '../model/SessionProvider';
import SessionMerger from './mergers/SessionMerger';
import SessionPersistence from '../model/SessionPersistence';

export default class DefaultSessionProvider implements SessionProvider {
  public session: BT.Session;
  private busy: boolean;
  public onSessionChanged: (session: BT.Session) => void = () => {
    /**/
  };

  constructor(
    private browserController: BrowserController,
    private sessionMerger: SessionMerger,
    private persistence: SessionPersistence
  ) {
    this.session = BT.EmptySession;
    this._updateSession = this._updateSession.bind(this);
    this.browserController.addEventListener(this.handleBrowserEvent.bind(this));
    this.busy = false;
  }

  async initialiseSession() {
    if (!this.busy) {
      this.busy = true;
      const retrievedSession = await this.persistence.retrieveSession();
      const liveSession = await this.getLiveSession();
      this.session = this.mergeSessions(retrievedSession, liveSession);
      await this.setSession(this.session);
      this.busy = false;
    }
  }

  async updateSession() {
    await this._updateSession();
    await this.persistence.storeSession(this.session);
    this.onSessionChanged(this.session);
  }

  async setSession(session: BT.Session) {
    this.session = session;
    await this.persistence.storeSession(this.session);
    this.onSessionChanged(this.session);
  }

  async setSessionNoDispatch(session: BT.Session) {
    this.session = session;
    await this.persistence.storeSession(this.session);
  }

  //////////////////////////

  private handleBrowserEvent(event: string) {
    this.updateSession();
  }

  private async _updateSession() {
    if (!this.busy) {
      this.busy = true;
      const liveSession = await this.getLiveSession();
      this.session = this.mergeSessions(this.session, liveSession);
      this.busy = false;
    }
  }

  private async getLiveSession(): Promise<BT.Session> {
    const sessionWindows: BT.Window[] = await this.browserController.getAllWindows();
    const panelWindow =
      this.findBrowserExtensionWindow(sessionWindows) || BT.getNewWindow();
    const filteredSessionWindows = sessionWindows.filter(
      w => w !== panelWindow
    );
    return new BT.Session(filteredSessionWindows, panelWindow);
  }

  private mergeSessions(retrievedSession: BT.Session, liveSession: BT.Session) {
    const session = this.sessionMerger.merge(liveSession, retrievedSession);
    return session;
  }

  private findBrowserExtensionWindow(
    windows: BT.Window[]
  ): BT.Window | undefined {
    const appURL = this.browserController.getAppURL();
    return windows.find(w => {
      return w.tabs.some(t => t.url === appURL);
    });
  }
}
