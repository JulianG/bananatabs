import { TabMutator } from '../core/Mutators';

export class NullTabMutator implements TabMutator {
  async selectTab(winId: number, tabId: number) {}
  async hideTab(winId: number, tabId: number) {}
  async showTab(winId: number, tabId: number) {}
  async deleteTab(winId: number, tabId: number) {}
}
