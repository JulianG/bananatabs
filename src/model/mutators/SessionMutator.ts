import * as BT from '../core/CoreTypes';
import SessionProvider from '../SessionProvider';

interface WindowSortingFunction {
  (a: BT.Window, b: BT.Window): number;
}

interface SessionMutator {
  sortWindows(f: WindowSortingFunction): void;
  updateWindows(windows: BT.Window[]): void;
  addWindows(windows: BT.Window[]): void;
}

export default SessionMutator;

export class DefaultSessionMutator {
  constructor(private provider: SessionProvider) {}

  sortWindows(f: WindowSortingFunction): void {
    const session = this.provider.session;
    const newSession = new BT.Session(
      [...session.windows].sort(f),
      session.panelWindow
    );
    this.provider.setSession(newSession);
  }

  updateWindows(windows: BT.Window[]): void {
    const session = this.provider.session;
    const newSession = new BT.Session(windows, session.panelWindow);
    this.provider.setSession(newSession);
  }

  addWindows(windows: BT.Window[]): void {
    const session = this.provider.session;
    const newSession = new BT.Session(
      [...session.windows, ...windows],
      session.panelWindow
    );
    this.provider.setSession(newSession);
  }
}
