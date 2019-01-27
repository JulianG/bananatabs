import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';
import WindowMutator from './WindowMutator';
import BrowserController from './BrowserController';

export default class WindowAndTabMutator implements TabMutator, WindowMutator {
  constructor(
    private provider: SessionProvider,
    private browser: BrowserController
  ) {}

  // TabMutator interface

  async selectTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(winId);
    win.tabs.forEach(t => (t.active = t.id === tabId));
    await this.browser.selectTab(win.id, tabId);
    await this.updateSession(session);
  }

  toggleTabVisibility(winId: number, tabId: number) {
    const tab = this.provider.session.getTab(tabId);
    return tab.visible
      ? this.hideTab(winId, tabId)
      : this.showTab(winId, tabId);
  }

  async hideTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(winId);
    const tab = this.provider.session.getTab(tabId);
    tab.visible = false;
    if (win.visible) {
      this.safeRenameWindow(win);
      await this.browser.closeTab(tab.id);
    }
    await this.updateSession(session);
  }

  async showTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(winId);
    const tab = this.provider.session.getTab(tabId);
    tab.visible = true;
    if (win.visible) {
      await this.browser.showTab(win, tab);
      await this.updateSession(session);
    } else {
      await this.showWindow(winId); // !!!
    }
  }

  async deleteTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(winId);
    const tab = this.provider.session.getTab(tabId);
    const tabIndex = win.tabs.indexOf(tab);
    console.assert(tabIndex >= 0);
    if (tabIndex >= 0) {
      win.tabs = [...win.tabs.slice(0, tabIndex), ...win.tabs.slice(tabIndex + 1)];
    }
    if (win.visible && tab.visible) {
      this.safeRenameWindow(win);
      await this.browser.closeTab(tab.id);
    }
    await this.updateSession(session);
  }

  /// WindowMutator

  async renameWindow(id: number, title: string) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(id) || BT.getNullWindow();
    win.title = title;
    await this.updateSession(session);
  }

  async collapseWindow(id: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(id);
    win.expanded = false;
    await this.updateSession(session);
  }

  async expandWindow(id: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(id);
    win.expanded = true;
    await this.updateSession(session);
  }

  async toggleWindowVisibility(id: number) {
    const win = this.provider.session.getWindow(id);
    return win.visible ? this.hideWindow(id) : this.showWindow(id);
  }

  async hideWindow(id: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(id);
    this.safeRenameWindow(win);
    win.visible = false;
    await this.browser.closeWindow(win.id);
    await this.updateSession(session);
  }

  async showWindow(id: number) {
    const session = this.provider.session;
    const win = this.provider.session.getWindow(id);
    win.visible = true;
    await this.browser.showWindow(win);
    await this.updateSession(session);
  }

  async deleteWindow(id: number) {
    const session = this.provider.session;
    const win = session.getWindow(id);
    const index = session.windows.indexOf(win);
    console.assert(index >= 0);
    const windows =
      index >= 0
        ? [
            ...session.windows.slice(0, index),
            ...session.windows.slice(index + 1)
          ]
        : [...session.windows];
    if (win.visible) {
      await this.browser.closeWindow(win.id);
    }
    await this.updateSession(new BT.Session(windows, session.panelWindow));
  }

  ///

  private safeRenameWindow(window: BT.Window) {
    window.title = window.title.length > 0 ? window.title : 'My Window';
  }

  private async updateSession(session: BT.Session) {
    await this.provider.updateSession(session);
  }
}
