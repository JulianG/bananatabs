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
    const win = this.provider.getWindow(winId);
    win.tabs.forEach(t => (t.active = t.id === tabId));
    await this.storeSession();
    await this.browser.selectTab(win.id, tabId);
  }

  toggleTabVisibility(winId: number, tabId: number) {
    const tab = this.provider.getTab(tabId);
    tab.visible ? this.hideTab(winId, tabId) : this.showTab(winId, tabId);
  }

  async hideTab(winId: number, tabId: number) {
    const win = this.provider.getWindow(winId);
    const tab = this.provider.getTab(tabId);
    tab.visible = false;
    this.storeSession();
    if (win.visible) {
      this.safeRenameWindow(win);
      await this.storeSession();
      await this.browser.closeTab(tab.id);
    }
    this.dispatchSessionChange();
  }

  async showTab(winId: number, tabId: number) {
    const win = this.provider.getWindow(winId);
    const tab = this.provider.getTab(tabId);
    tab.visible = true;
    await this.storeSession();
    if (win.visible) {
      await this.browser.showTab(win, tab);
    } else {
      await this._showWindow(win);
    }
    this.dispatchSessionChange();
  }

  async deleteTab(winId: number, tabId: number) {
    const win = this.provider.getWindow(winId);
    const tab = this.provider.getTab(tabId);
    const tabIndex = win.tabs.indexOf(tab);
    console.assert(tabIndex >= 0);
    if (tabIndex >= 0) {
      win.tabs.splice(tabIndex, 1);
    }
    if (win.visible && tab.visible) {
      this.safeRenameWindow(win);
      await this.browser.closeTab(tab.id);
    }
    await this.storeSession();
    this.dispatchSessionChange();
  }

  /// WindowMutator

  async renameWindow(id: number, title: string) {
    const win = this.provider.getWindow(id) || BT.getNullWindow();
    win.title = title;
    await this.storeSession();
  }

  async collapseWindow(id: number) {
    const win = this.provider.getWindow(id);
    win.expanded = false;
    await this.storeSession();
    await this.dispatchSessionChange();
  }

  async expandWindow(id: number) {
    const win = this.provider.getWindow(id);
    win.expanded = true;
    await this.storeSession();
    this.dispatchSessionChange();
  }

  async toggleWindowVisibility(id: number) {
    const win = this.provider.getWindow(id);
    win.visible ? await this._hideWindow(win) : await this._showWindow(win);
    this.dispatchSessionChange();
  }

  async hideWindow(id: number) {
    const win = this.provider.getWindow(id);
    await this._hideWindow(win);
    this.dispatchSessionChange();
  }

  async showWindow(id: number) {
    const win = this.provider.getWindow(id);
    await this._showWindow(win);
    this.dispatchSessionChange();
  }

  async deleteWindow(id: number) {
    const win = this.provider.getWindow(id);
    const index = this.provider.session.windows.indexOf(win);
    console.assert(index >= 0);
    if (index >= 0) {
      this.provider.session.windows.splice(index, 1);
    }
    await this.storeSession();
    if (win.visible) {
      await this.browser.closeWindow(win.id);
    }
    this.dispatchSessionChange();
  }

  ///

  private async _hideWindow(window: BT.Window) {
    this.safeRenameWindow(window);
    window.visible = false;
    await this.storeSession();
    await this.browser.closeWindow(window.id);
  }

  private async _showWindow(window: BT.Window) {
    window.visible = true;
    await this.storeSession();
    await this.browser.showWindow(window);
  }

  ///

  private safeRenameWindow(window: BT.Window) {
    window.title = window.title.length > 0 ? window.title : 'My Window';
  }

  private storeSession() {
    this.provider.storeSession(this.provider.session);
  }

  private dispatchSessionChange() {
    this.provider.onSessionChanged(this.provider.session);
  }
}
