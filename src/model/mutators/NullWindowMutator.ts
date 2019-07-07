import { WindowMutator } from '../core/Mutators';
import { EmptySession } from '../core/CoreTypes';

export class NullWindowMutator implements WindowMutator {
  async renameWindow(id: number, title: string) {
    return EmptySession;
  }

  async collapseWindow(id: number) {
    return EmptySession;
  }

  async expandWindow(id: number) {
    return EmptySession;
  }

  async hideWindow(id: number) {
    return EmptySession;
  }

  async showWindow(id: number) {
    return EmptySession;
  }

  async deleteWindow(id: number) {
    return EmptySession;
  }
}
