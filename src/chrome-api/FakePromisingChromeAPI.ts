import console from '../utils/MutedConsole';

import {
  PromisingChromeAPI,
  ChromeWindowsAPI,
  ChromeTabsAPI,
  ChromeSystemAPI,
  ChromeExtensionAPI
} from './PromisingChromeAPI';

import * as FCE from './FakeChromeEvent';

const FakeDisplayUnitInfo: chrome.system.display.DisplayUnitInfo = {
  id: 'fake-display',
  name: 'FakeDisplay',
  isPrimary: true,
  isEnabled: true,
  bounds: { top: 0, left: 0, width: 1920, height: 1040 },
  workArea: { top: 0, left: 0, width: 1920, height: 1040 }
};

export default class FakePromisingChromeAPI implements PromisingChromeAPI {
  public readonly windows: ChromeWindowsAPI;
  public readonly tabs: ChromeTabsAPI;
  public readonly system: ChromeSystemAPI;
  public readonly extension: ChromeExtensionAPI;

  public fakeWindows: chrome.windows.Window[];

  public fake = {
    windows: {
      create: this.createWindow.bind(this),
      update: this.updateWindow.bind(this),
      remove: this.removeWindow.bind(this)
    },
    tabs: {
      create: this.createTab.bind(this),
      update: this.updateTab.bind(this),
      remove: this.removeTab.bind(this),
      move: this.moveTabs.bind(this)
    }
  };

  private fakeIdCount: number;
  private currentTab: chrome.tabs.Tab = {
    index: 0,
    pinned: false,
    highlighted: false,
    windowId: -1,
    active: false,
    selected: false,
    incognito: false,
    discarded: false,
    autoDiscardable: false
  };

  static clone(that: FakePromisingChromeAPI) {
    const fchrome = new FakePromisingChromeAPI();
    fchrome.fakeWindows = that.fakeWindows;
    fchrome.fakeIdCount = that.fakeIdCount;
    fchrome.currentTab = that.currentTab;
    return fchrome;
  }
  constructor(
    private fakeDisplayUnitInfoArray: chrome.system.display.DisplayUnitInfo[] = [
      FakeDisplayUnitInfo
    ]
  ) {
    const self = this;

    this.fakeWindows = [];
    this.fakeIdCount = 5000;

    this.windows = {
      onCreated: new FCE.WindowReferenceEvent(),
      onRemoved: new FCE.WindowIdEvent(),
      onFocusChanged: new FCE.WindowIdEvent(),

      async getAll(
        getInfo: chrome.windows.GetInfo
      ): Promise<chrome.windows.Window[]> {
        return self.fakeWindows;
      },
      create: self.createWindow.bind(this),
      update: self.updateWindow.bind(this),
      remove: self.removeWindow.bind(this)
    };

    this.tabs = {
      onActivated: new FCE.TabActivatedEvent(),
      onAttached: new FCE.TabAttachedEvent(), // never triggered!
      onCreated: new FCE.TabCreatedEvent(),
      onMoved: new FCE.TabMovedEvent(), // never triggered!
      onRemoved: new FCE.TabRemovedEvent(),
      onUpdated: new FCE.TabUpdatedEvent(),
      onHighlighted: new FCE.TabHighlightedEvent(), // never triggered!

      create: self.createTab.bind(this),
      update: self.updateTab.bind(this),
      remove: self.removeTab.bind(this),
      move: self.moveTabs.bind(this),

      async getCurrent() {
        return self.currentTab;
      }
    };

    this.system = {
      display: {
        async getInfo(options: {}): Promise<
          chrome.system.display.DisplayUnitInfo[]
        > {
          return self.fakeDisplayUnitInfoArray;
        }
      }
    };

    this.extension = {
      getURL: (path: string) => {
        return '/' + path;
      }
    };
  }

  private createWindow(createData: chrome.windows.CreateData) {
    const newWindow = this._createWindow(createData);
    this.fakeWindows.push(newWindow);
    if (createData.focused) {
      this._focusWindow(newWindow.id, true);
      consoleLogFakeDispatch(`windows.onFocusChanged`);
      (this.windows.onFocusChanged as FCE.WindowIdEvent).fakeDispatch(
        this._getFocusedWindowId()
      );
    }
    const activeTabChanged = this._normaliseActiveTabs(newWindow);
    if (activeTabChanged) {
      const activeTabId = this._getActiveTabId(newWindow);
      this.dispatchTabActivated(activeTabId, newWindow.id);
    }
    consoleLogFakeDispatch(`windows.onCreated`);
    (this.windows.onCreated as FCE.WindowReferenceEvent).fakeDispatch(
      newWindow
    );
    if (newWindow.tabs) {
      newWindow.tabs.forEach(async tab => {
        consoleLogFakeDispatch(`tabs.onCreated`);
        (this.tabs.onCreated as FCE.TabCreatedEvent).fakeDispatch(tab);
        consoleLogFakeDispatch(`tabs.onActivated`);
        (this.tabs.onActivated as FCE.TabActivatedEvent).fakeDispatch({
          tabId: tab.id,
          windowId: tab.windowId
        });
        consoleLogFakeDispatch(`tabs.onHighlighted`);
        (this.tabs.onHighlighted as FCE.TabHighlightedEvent).fakeDispatch({
          tabIds: [tab.id],
          windowId: tab.windowId
        });
        this.delayedCompleteTab(tab.id!, 1);
      });
    }
    return newWindow;
  }

  private updateWindow(id: number, updateInfo: chrome.windows.UpdateInfo) {
    const existingWindow = this._getWindow(id);
    const prevFocused = existingWindow.focused;
    this._updateWindow(existingWindow, updateInfo);
    if (existingWindow.focused !== prevFocused) {
      consoleLogFakeDispatch(`windows.onFocusChanged`);
      (this.windows.onFocusChanged as FCE.WindowIdEvent).fakeDispatch(
        this._getFocusedWindowId()
      );
    }
    return existingWindow;
  }

  private removeWindow(id: number) {
    const index = this.fakeWindows.findIndex(w => w.id === id);
    if (index > -1) {
      const win = this.fakeWindows[index];
      const tabIds = (win.tabs || []).map(t => t.id);
      tabIds.forEach(this.removeTabWhileWindowClosing.bind(this));
      this.fakeWindows.splice(index, 1);

      if (win.focused) {
        const nextFocusedWindowId = this._getLastWindowId();
        this._focusWindow(nextFocusedWindowId, true);
        consoleLogFakeDispatch(`windows.onFocusChanged`);
        (this.windows.onFocusChanged as FCE.WindowIdEvent).fakeDispatch(
          this._getFocusedWindowId()
        );
      }
      consoleLogFakeDispatch(`windows.onRemoved`);
      (this.windows.onRemoved as FCE.WindowIdEvent).fakeDispatch(id);
      return win;
    } else {
      throw new Error(`failed to remove window with id: ${id}`);
    }
  }

  private removeTabWhileWindowClosing(id: number) {
    try {
      const winId = this._removeTab(id);
      consoleLogFakeDispatch(`tabs.onRemoved`);
      (this.tabs.onRemoved as FCE.TabRemovedEvent).fakeDispatch(id, {
        windowId: winId,
        isWindowClosing: true
      });
    } catch (e) {
      throw new Error(`failed to remove tab with id: ${id}`);
    }
  }

  private createTab(props: chrome.tabs.CreateProperties) {
    const newTab = this._createTab(props);
    const win = this._getWindow(newTab.windowId);
    this._addTabToWindow(win, newTab);
    if (newTab.active && newTab.id) {
      this._setActiveTab(newTab.id, true);
      this.dispatchTabActivated(newTab.id, newTab.windowId);
    }
    consoleLogFakeDispatch(`tabs.onCreated`);
    (this.tabs.onCreated as FCE.TabCreatedEvent).fakeDispatch(newTab);
    this.delayedCompleteTab(newTab.id!, 1);
    return newTab;
  }

  private delayedCompleteTab(id: number, delay: number) {
    consoleLogFakeDispatch(`tabs.onUpdated (delayedCompleteTab)`);
    const event = this.tabs.onUpdated as FCE.TabUpdatedEvent;
    setTimeout(() => event.fakeDispatch(id, { status: 'complete' }), delay);
  }

  private updateTab(id: number, props: chrome.tabs.UpdateProperties) {
    const tab = this._getTab(id);
    if (tab) {
      const changeInfo: chrome.tabs.TabChangeInfo = {};
      changeInfo.pinned = props.pinned !== undefined ? props.pinned : undefined;

      tab.status = 'complete';
      tab.autoDiscardable =
        props.autoDiscardable !== undefined
          ? props.autoDiscardable
          : tab.autoDiscardable;
      tab.highlighted =
        props.highlighted !== undefined ? props.highlighted : tab.highlighted;
      tab.openerTabId =
        props.openerTabId !== undefined ? props.openerTabId : tab.openerTabId;
      tab.pinned = props.pinned !== undefined ? props.pinned : tab.pinned;
      tab.selected =
        props.selected !== undefined ? props.selected : tab.selected;
      tab.url = props.url !== undefined ? props.url : tab.url;

      if (props.active !== undefined) {
        const changed = this._setActiveTab(id, props.active);
        if (changed && props.active) {
          this.dispatchTabActivated(id, tab.windowId);
        }
      }
      if (changeInfo.pinned !== undefined) {
        consoleLogFakeDispatch(`tabs.onUpdated (updateTab)`);
        (this.tabs.onUpdated as FCE.TabUpdatedEvent).fakeDispatch(
          id,
          changeInfo
        );
      }
    } else {
      throw new Error('Failed to update tab id: ' + id);
    }
    return tab;
  }

  private removeTab(id: number) {
    try {
      const winId = this._removeTab(id);

      const win = this._getWindow(winId);
      if (win && win.tabs!.length === 0) {
        console.warn('also removing window!' + winId);
        this.removeWindow(winId);
      } else {
        consoleLogFakeDispatch(`tabs.onRemoved`);
        (this.tabs.onRemoved as FCE.TabRemovedEvent).fakeDispatch(id, {
          windowId: winId,
          isWindowClosing: false
        });
      }
    } catch (e) {
      throw new Error(`failed to remove tab with id: ${id}`);
    }
  }

  private moveTabs(tabId: number, moveProperties: chrome.tabs.MoveProperties) {
    //
    const sourceWindow = this._getWindowForTab(tabId);
    const sourceTabs = sourceWindow.tabs!;
    const fromIndex = sourceTabs.findIndex(t => t.id === tabId);

    const windowId = moveProperties.windowId || sourceWindow.id;
    const toIndex = moveProperties.index;

    const targetWindow = this._getWindow(windowId);
    const targetTabs = targetWindow.tabs || [];

    const [tab] = sourceTabs.splice(fromIndex, 1);

    targetTabs.splice(toIndex, 0, tab);
    targetTabs.forEach((t, i) => (t.index = i));

    if (sourceWindow !== targetWindow) {
      console.warn(
        'FakePromisingChromeAPI not currently dispatching ' +
          'the proper onDetach and onAttach events ' +
          'when a tab is moved from one window to the other'
      );
    }
    consoleLogFakeDispatch(`tabs.onMoved`);
    (this.tabs.onMoved as FCE.TabMovedEvent).fakeDispatch(tabId, {
      toIndex,
      fromIndex,
      windowId
    });
  }

  private dispatchTabActivated(tabId: number, windowId: number) {
    consoleLogFakeDispatch(`tabs.onActivated`);
    (this.tabs.onActivated as FCE.TabActivatedEvent).fakeDispatch({
      tabId,
      windowId
    });
    consoleLogFakeDispatch(`tabs.onHighlighted`);
    (this.tabs.onHighlighted as FCE.TabHighlightedEvent).fakeDispatch({
      tabIds: [tabId],
      windowId
    });
  }

  ////////////////////
  //////////////////// no dispatching beyond this line!
  ////////////////////

  private _createWindow(
    createData: chrome.windows.CreateData
  ): chrome.windows.Window {
    const windowId = this._getNextId();

    const tabs = this._createTabsFromURLs(windowId, createData.url);

    return {
      id: windowId,
      state: createData.state || 'normal',
      focused: createData.focused || false,
      alwaysOnTop: false,
      incognito: createData.incognito || false,
      type: createData.type || 'normal',
      tabs: tabs,
      top: createData.top,
      left: createData.left,
      width: createData.width,
      height: createData.height
    };
  }

  private _createTabsFromURLs(
    windowId: number,
    urls: string | string[] | undefined
  ): chrome.tabs.Tab[] {
    if (urls === undefined) {
      return [this._createTab({ windowId })];
    }
    if (Array.isArray(urls)) {
      return urls.length > 0
        ? urls.map(url => this._createTab({ windowId, url }))
        : [this._createTab({ windowId })];
    } else {
      const url = urls;
      return [this._createTab({ windowId, url })];
    }
  }

  private _updateWindow(
    window: chrome.windows.Window,
    updateInfo: chrome.windows.UpdateInfo
  ) {
    window.state =
      updateInfo.state !== undefined ? updateInfo.state : window.state;
    window.top = updateInfo.top !== undefined ? updateInfo.top : window.top;
    window.left = updateInfo.left !== undefined ? updateInfo.left : window.left;
    window.width =
      updateInfo.width !== undefined ? updateInfo.width : window.width;
    window.height =
      updateInfo.height !== undefined ? updateInfo.height : window.height;
    if (updateInfo.focused !== undefined) {
      this._focusWindow(window.id, updateInfo.focused);
    }
    return window;
  }

  private _getWindow(id: number): chrome.windows.Window {
    const win = this.fakeWindows.find(w => w.id === id);
    if (win) {
      return win;
    } else {
      throw new Error(`Cannot find window by id:${id}`);
    }
  }

  private _createTab(props: chrome.tabs.CreateProperties): chrome.tabs.Tab {
    const windowId = props.windowId || this._getFocusedWindowId();
    const win = this.fakeWindows.find(w => w.id === windowId);
    const defaultIndex = win ? (win.tabs || []).length : 0;

    const tab = {
      id: this._getNextId(),
      index: props.index || defaultIndex,
      pinned: props.pinned || false,
      highlighted: false,
      windowId,
      active: props.active !== undefined ? props.active : true,
      incognito: false,
      selected: props.selected || false,
      discarded: false,
      autoDiscardable: false,
      url: props.url || 'chrome://newtab/',
      openerTabId: props.openerTabId
    };
    return tab;
  }

  private _focusWindow(id: number, value: boolean): boolean {
    let change = false;

    if (id !== -1) {
      const window = this._getWindow(id);
      change = window.focused !== value;
    }

    this.fakeWindows.forEach(w => {
      w.focused = w.id === id ? value : false;
    });

    return change;
  }

  private _getFocusedWindowId(): number {
    const focusedWindow = this.fakeWindows.find(w => w.focused);
    return focusedWindow ? focusedWindow.id : -1;
  }

  private _removeTab(id: number): number {
    const win = this._getWindowForTab(id);
    const tabs = win.tabs || [];
    const index = tabs.findIndex(t => t.id === id);
    tabs.splice(index, 1);
    return win.id;
  }

  private _getTab(id: number): chrome.tabs.Tab {
    const window = this._getWindowForTab(id);
    const tab = window.tabs!.find(t => t.id === id);
    if (!tab) {
      throw new Error(
        `Failed to find tab with id: ${id} in window ${window.id}`
      );
    }
    return tab;
  }

  private _getWindowForTab(tabId: number): chrome.windows.Window {
    const win = this.fakeWindows.find(w => {
      return (
        (w.tabs || []).find(t => {
          return t.id === tabId;
        }) !== undefined
      );
    });
    if (!win) {
      throw new Error(`Failed to find window for tab with id: ${tabId}`);
    }
    return win;
  }

  private _getLastWindowId() {
    return this.fakeWindows.length >= 1
      ? this.fakeWindows[this.fakeWindows.length - 1].id
      : -1;
  }

  private _getActiveTabId(window: chrome.windows.Window): number {
    const activeTab = (window.tabs || []).find(t => t.active);
    return activeTab ? activeTab.id || -1 : -1;
  }

  private _getNextId(): number {
    return this.fakeIdCount++;
  }

  private _normaliseActiveTabs(window: chrome.windows.Window): boolean {
    const id = this._calculateActiveTabId(window);
    if (id) {
      const changed = this._setActiveTab(id, true);
      return changed;
    }
    return false;
  }

  private _setActiveTab(id: number, value: boolean): boolean {
    const tab = this._getTab(id);
    if (!tab) {
      throw new Error(`Cannot find tab by id: ${id}`);
    }
    const window = this._getWindowForTab(id);
    const change = tab.active !== value;
    window.tabs!.forEach(t => {
      t.active = t.id === id ? value : false;
      t.highlighted = t.active;
    });

    return change;
  }

  private _addTabToWindow(win: chrome.windows.Window, newTab: chrome.tabs.Tab) {
    if (win.tabs === undefined) {
      win.tabs = [];
    }
    win.tabs.push(newTab);
    newTab.windowId = win.id;
  }

  private _calculateActiveTabId(window: chrome.windows.Window): number {
    const tabs = window.tabs || [];
    if (tabs.length < 1) {
      return -1;
    }
    const activeTabs = tabs.filter(t => t.active);

    const id = activeTabs.length
      ? activeTabs[activeTabs.length - 1].id!
      : tabs[tabs.length - 1].id!;

    return id;
  }
}

function consoleLogFakeDispatch(msg: string) {
  // console.log('fakeDispatch', msg);
}
