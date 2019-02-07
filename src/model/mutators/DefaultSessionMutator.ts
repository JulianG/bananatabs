import * as BT from '../core/CoreTypes';
import { SessionMutator } from './Mutators';
import * as CoreMutations from '../core/CoreMutations';
import { SessionProvider } from '../SessionProvider';

export class DefaultSessionMutator implements SessionMutator {
  constructor(private provider: SessionProvider) {}

  sortWindows(f: (a: BT.Window, b: BT.Window) => number): void {
    this.provider.setSession(
      CoreMutations.sortWindows(this.provider.session, f)
    );
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
