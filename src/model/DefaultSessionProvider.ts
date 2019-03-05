import * as BT from './core/CoreTypes';
import { BrowserController } from './browsercontroller/BrowserController';
import { SessionProvider } from './core/SessionProvider';
import { SessionPersistence } from './core/SessionPersistence';

export class DefaultSessionProvider implements SessionProvider {
  public session: BT.Session;
  private busy: boolean;
  public onSessionChanged: (session: BT.Session) => void = () => {
    /**/
  };

  constructor(
    private browserController: BrowserController,
    private mergeSessions: (stored: BT.Session, live: BT.Session) => BT.Session,
    private persistence: SessionPersistence
  ) {
    this.session = BT.EmptySession;
    this._updateSession = this._updateSession.bind(this);
    this.handleBrowserEvent = this.handleBrowserEvent.bind(this);
    this.enableBrowserEvents();
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
    this.disableBrowserEvents();
    await this._updateSession();
    await this.persistence.storeSession(this.session);
    this.onSessionChanged(this.session);
    this.enableBrowserEvents();
  }

  async setSession(session: BT.Session) {
    this.session = session;
    this.disableBrowserEvents();
    await this.persistence.storeSession(this.session);
    this.onSessionChanged(this.session);
    this.enableBrowserEvents();
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

  private findBrowserExtensionWindow(
    windows: BT.Window[]
  ): BT.Window | undefined {
    const appURL = this.browserController.getAppURL();
    return windows.find(w => {
      return w.tabs.some(t => t.url === appURL);
    });
  }

  private enableBrowserEvents() {
    this.browserController.addEventListener(this.handleBrowserEvent);
  }

  private disableBrowserEvents() {
    try {
      this.browserController.removeEventListener(this.handleBrowserEvent);
    } catch (e) {
      // ignore error
    }
  }
}
