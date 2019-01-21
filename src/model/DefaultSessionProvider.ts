import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';
import SessionProvider from '../model/SessionProvider';
import SessionMerger from './mergers/SessionMerger';
import SessionPersistence from '../model/SessionPersistence';

import console from '../utils/MutedConsole';

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

  getWindow(id: number): BT.Window {
    const win = this.session.windows.find(w => w.id === id);
    console.assert(
      win !== undefined,
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
      tab !== undefined,
      `Could not find a tab with id ${id} in the current session.`
    );
    return tab || { ...BT.getNullTab(), id };
  }

  async initialiseSession(reason?: string) {
    if (!this.busy) {
      this.busy = true;
      console.groupCollapsed(
        `SessionProvider.initialiseSession ... because ${reason}.`
      );
      console.log(`  getting session from disk...`);
      const retrievedSession = await this.persistence.retrieveSession();
      console.log(`  -- windows: ${retrievedSession.windows.length}`);
      console.log(BT.DEBUG_sessionToString(retrievedSession));
      console.log(`  getting session from browser...`);
      const liveSession = await this.getLiveSession();
      console.log(`  -- windows: ${liveSession.windows.length}`);
      console.log(BT.DEBUG_sessionToString(liveSession));
      console.log(`  done. now merging sessions`);
      this.session = this.mergeSessions(retrievedSession, liveSession, reason);
      console.log(`  -- windows: ${this.session.windows.length}`);
      console.log(BT.DEBUG_sessionToString(this.session));
      console.log(`  done. now storing session`);
      await this.storeSession(this.session);
      console.log(`  done. now...`);
      console.log(
        `SessionProvider.initialiseSession calling onSessionChanged because: ${reason}`
      );
      this.onSessionChanged(this.session);
      console.log(
        `SessionProvider.initialiseSession CALLED onSessionChanged because: ${reason}`
      );
      this.busy = false;
      console.groupEnd();
    } else {
      console.warn(
        'SessionProvider.initialiseSession -- skipping because busy'
      );
    }
  }

  async updateSession(reason?: string) {
    console.log(`SessionProvider.updateSession ... because: ${reason}`);
    await this._updateSession(reason);
    console.log(
      `SessionProvider.updateSession calling onSessionChanged because: ${reason}`
    );
    this.onSessionChanged(this.session);
    console.log(
      `SessionProvider.updateSession CALLED onSessionChanged because: ${reason}`
    );
  }

  async storeSession(session: BT.Session) {
    await this.persistence.storeSession(session);
  }

  //////////////////////////

  private handleBrowserEvent(event: string, reason?: string) {
    console.log(`handleBrowserEvent: ${event} because ${reason}`);
    this.updateSession(reason);
  }

  private async _updateSession(reason?: string) {
    if (!this.busy) {
      this.busy = true;
      console.log(`SessionProvider._updateSession because ${reason}.`);
      const liveSession = await this.getLiveSession();
      this.session = this.mergeSessions(this.session, liveSession, reason);
      await this.storeSession(this.session);
      this.busy = false;
    } else {
      console.warn(
        'SessionProvider._updateSession -- skipping because busy // reason:' +
          reason
      );
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

  private mergeSessions(
    retrievedSession: BT.Session,
    liveSession: BT.Session,
    reason?: string
  ) {
    console.log(`  Merging sessions because ${reason}...`);
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
