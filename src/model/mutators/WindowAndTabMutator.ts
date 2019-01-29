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
    const newSession = selectTab(this.provider.session, winId, tabId);
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<<<
    await this.browser.selectTab(winId, tabId);
  }

  toggleTabVisibility(winId: number, tabId: number) {
    const tab = this.provider.session.getTab(tabId);
    return tab.visible
      ? this.hideTab(winId, tabId)
      : this.showTab(winId, tabId);
  }

  async hideTab(winId: number, tabId: number) {
    const newSession = mutateTab(this.provider.session, winId, tabId, {
      visible: false
    });
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<<<
    const win: BT.Mutable<BT.Window> = newSession.getWindow(winId);
    if (win.visible) {
      await this.browser.closeTab(tabId);
    }
  }

  async showTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const windowWasVisible = session.getWindow(winId).visible;
    const newSession = mutateTab(session, winId, tabId, { visible: true });
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<<<
    if (windowWasVisible) {
      await this.browser.showTab(
        newSession.getWindow(winId),
        newSession.getTab(tabId)
      );
    } else {
      await this.browser.showWindow(newSession.getWindow(winId));
    }
  }

  async deleteTab(winId: number, tabId: number) {
    const session = this.provider.session;
    const tabWasVisible =
      session.getWindow(winId).visible && session.getTab(tabId).visible;
    if (tabWasVisible) {
      await this.browser.closeTab(tabId);
    }
    const newSession = deleteTab(session, winId, tabId);
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<<<
  }

  /// WindowMutator

  async renameWindow(id: number, title: string) {
    const newSession = mutateWindow(this.provider.session, id, { title });
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<<<
  }

  async collapseWindow(id: number) {
    await this.provider.updateSession(
      mutateWindow(this.provider.session, id, { expanded: false })
    );
  }

  async expandWindow(id: number) {
    await this.provider.updateSession(
      mutateWindow(this.provider.session, id, { expanded: true })
    );
  }

  async toggleWindowVisibility(id: number) {
    const win = this.provider.session.getWindow(id);
    return win.visible ? this.hideWindow(id) : this.showWindow(id);
  }

  async hideWindow(id: number) {
    const newSession = mutateWindow(this.provider.session, id, {
      visible: false
    });
    await this.browser.closeWindow(id);
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<
  }

  async showWindow(id: number) {
    const newSession = mutateWindow(this.provider.session, id, {
      visible: true
    });
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<
    await this.browser.showWindow(this.provider.session.getWindow(id));
  }

  async deleteWindow(id: number) {
    const wasWindowVisible = this.provider.session.getWindow(id).visible;
    const newSession = deleteWindow(this.provider.session, id);
    if (wasWindowVisible) {
      await this.browser.closeWindow(id);
    }
    await this.provider.updateSession(newSession); // <<<<<<<<<<<<<<<<<<<<<<
  }
}

////////////
////////////
////////////
////////////

function selectTab(
  session: BT.Session,
  winId: number,
  tabId: number
): BT.Session {
  const windows = session.windows.map(w => {
    return winId === w.id
      ? BT.cloneWindow(w, {
          tabs: w.tabs.map(t => ({ ...t, active: t.id === tabId }))
        })
      : BT.cloneWindow(w);
  });
  return new BT.Session(windows, session.panelWindow);
}

function mutateTab(
  session: BT.Session,
  winId: number,
  tabId: number,
  props: Partial<BT.Tab>
): BT.Session {
  const windows = session.windows.map(w => {
    return w.id === winId
      ? {
          ...safeRenameWindow(w),
          tabs: w.tabs.map(t => {
            return t.id === tabId ? BT.cloneTab(t, props) : BT.cloneTab(t);
          })
        }
      : { ...w };
  });
  return new BT.Session(windows, session.panelWindow);
}

function safeRenameWindow(window: BT.Window): BT.Window {
  return { ...window, title: window.title || 'My Window' };
}

function deleteTab(
  session: BT.Session,
  winId: number,
  tabId: number
): BT.Session {
  const windows = session.windows.map(w => {
    if (w.id === winId) {
      const tabIndex = w.tabs.findIndex(t => t.id === tabId);
      console.assert(tabIndex >= 0);
      const tabs =
        tabIndex >= 0
          ? [...w.tabs.slice(0, tabIndex), ...w.tabs.slice(tabIndex + 1)]
          : w.tabs.map(t => t);
      return {
        ...safeRenameWindow(w),
        tabs: tabs
      };
    } else {
      return BT.cloneWindow(w);
    }
  });
  return new BT.Session(windows, session.panelWindow);
}

function mutateWindow(
  session: BT.Session,
  id: number,
  props: Partial<BT.Window>
): BT.Session {
  const windows = session.windows.map(w => {
    return w.id === id
      ? BT.cloneWindow(safeRenameWindow(w), props)
      : BT.cloneWindow(w);
  });
  return new BT.Session(windows, session.panelWindow);
}

function deleteWindow(session: BT.Session, id: number): BT.Session {
  const index = session.windows.findIndex(w => w.id === id);
  console.assert(index >= 0);
  const windows =
    index >= 0
      ? [
          ...session.windows.slice(0, index),
          ...session.windows.slice(index + 1)
        ]
      : [...session.windows];
  return new BT.Session(windows, session.panelWindow);
}
