import * as BT from '../core/CoreTypes';
import * as CoreMutations from '../core/CoreMutations';

import SessionProvider from '../SessionProvider';

interface SessionMutator {
  sortWindows(f: (a: BT.Window, b: BT.Window) => number): void;
  setWindows(windows: BT.Window[]): void;
  addWindows(windows: BT.Window[]): void;
}

export default SessionMutator;

export class DefaultSessionMutator {
  constructor(private provider: SessionProvider) {}

  sortWindows(f: (a: BT.Window, b: BT.Window) => number): void {
    this.provider.setSession(CoreMutations.sortWindows(this.provider.session, f));
  }

  setWindows(windows: ReadonlyArray<BT.Window>): void {
    this.provider.setSession(
      new BT.Session(windows, this.provider.session.panelWindow)
    );
  }

  addWindows(windows: ReadonlyArray<BT.Window>): void {
    this.provider.setSession(
      CoreMutations.addWindows(this.provider.session, windows)
    );
  }
}
