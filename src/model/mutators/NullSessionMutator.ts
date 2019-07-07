import * as BT from '../core/CoreTypes';
import { SessionMutator } from '../core/Mutators';

export class NullSessionMutator implements SessionMutator {
  sortWindows(f: (a: BT.Window, b: BT.Window) => number): void {}
  setWindows(windows: ReadonlyArray<BT.Window>): void {}
  addWindows(windows: ReadonlyArray<BT.Window>): void {}
}
