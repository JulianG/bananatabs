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
      await this.updateSession(this.session);
      this.busy = false;
    }
  }

  async updateSession(session?: BT.Session) {
    if (session) {
      await this.persistence.storeSession(session);
    } else {
      await this._updateSession();
      await this.persistence.storeSession(this.session);
    }
    this.onSessionChanged(this.session);
  }

  getWindow(id: number): BT.Window {
    const win = this.session.windows.find(w => w.id === id);
    console.assert(
      win,
      `Could not find a window with id ${id} in the current session.`
    );
    return win || { ...BT.getNullWindow(), id };
  }

  getTab(id: number): BT.Tab {
    const win =
      this.session.windows.find(w => w.tabs.some(t => t.id === id)) ||
      BT.getNullWindow();
    const tab = win.tabs.find(t => t.id === id);
    console.assert(
      tab,
      `Could not find a tab with id ${id} in the current session.`
    );
    return tab || { ...BT.getNullTab(), id };
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
      this.findBrowserExtensionWindow(sessionWindows) || BT.getNullWindow();
    const filteredSessionWindows = sessionWindows.filter(
      w => w !== panelWindow
    );
    return { windows: filteredSessionWindows, panelWindow };
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
