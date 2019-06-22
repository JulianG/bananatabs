import * as BT from '../model/core/CoreTypes';
import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import {
  BrowserController,
  SystemDisplayInfo,
} from '../model/browsercontroller/BrowserController';
import { BrowserEventDispatcher } from '../model/browsercontroller/BrowserEventDispatcher';
import { ChromeEventDispatcher } from './ChromeEventDispatcher';

export class ChromeBrowserController implements BrowserController {
  private chromeAPI: PromisingChromeAPI;
  private browserEventDispatcher: BrowserEventDispatcher;

  constructor(chromeAPI: PromisingChromeAPI) {
    this.chromeAPI = chromeAPI;
    this.browserEventDispatcher = new ChromeEventDispatcher(chromeAPI);
  }

  public async closeWindow(id: number) {
    try {
      await this.chromeAPI.windows.remove(id);
    } catch (e) {
      console.warn(`Could not remove window from chromeAPI... ${id}`);
    }
  }

  public async closeTab(id: number) {
    try {
      await this.chromeAPI.tabs.remove(id);
    } catch (e) {
      console.warn(`Could not remove tab from chromeAPI ... ${id}`);
    }
  }

  public async selectTab(windowId: number, tabId: number) {
    await this.chromeAPI.windows.update(windowId, {
      focused: true,
    });
    try {
      await this.chromeAPI.tabs.update(tabId, { active: true });
    } catch (e) {
      console.error(e);
    }
  }

  public async showTab(window: BT.Window, tab: BT.Tab) {
    const props: chrome.tabs.CreateProperties = {
      windowId: window.visible ? window.id : 0,
      index: Math.max(tab.index, 0),
      url: tab.url,
      active: tab.active,
    };
    const newTab = await this.chromeAPI.tabs.create(props);
    tab = { ...tab, id: newTab.id || -1 };
  }

  public async showWindow(window: BT.Window) {
    const liveWindows = await this.chromeAPI.windows.getAll({});
    const asFirst = liveWindows.length <= 1;
    if (asFirst) {
      await this._showWindowAsFirst(window);
    } else {
      await this._showWindow(window);
    }
  }

  public async getAllWindows(): Promise<BT.Window[]> {
    const wins = await this.chromeAPI.windows.getAll({ populate: true });
    return wins.map(convertWindow);
  }

  public addEventListener(listener: (event: string, reason?: string) => void) {
    this.browserEventDispatcher.addListener(listener);
  }

  public removeEventListener(
    listener: (event: string, reason?: string) => void
  ) {
    this.browserEventDispatcher.removeListener(listener);
  }

  public async getDisplayInfo(): Promise<SystemDisplayInfo[]> {
    const chromeDisplays = await this.chromeAPI.system.display.getInfo({});
    return chromeDisplays.map(d => {
      return { id: d.id, bounds: d.bounds };
    });
  }

  public getAppURL(): string {
    return this.chromeAPI.extension.getURL('index.html');
  }

  public async dockAppWindow(position: 'left' | 'right', fraction: 3 | 4 | 5) {
    const displays = await this.getDisplayInfo();
    const appWindow = await this.getAppWindow();
    if (appWindow) {
      const display = findDisplayContainingWindow(displays, appWindow);
      if (display) {
        const newAppBounds = createAppWindowBounds(
          display.bounds,
          position,
          fraction
        );
        this.chromeAPI.windows.update(appWindow.id, newAppBounds);
      }
    }
  }

  /////

  private async _showWindowAsFirst(window: BT.Window) {
    /*
		This is a horrible work-around for when Chrome settings are
		set to re-open the last open session.
		We only call this if there are no other windows open.
		We first create an "empty" minimised window, just in case
		Chrome wants to add a bunch of previously opened tabs to it.
		Then we open the window that the user is trying to show.
		Then we close the minimised window.
		 */
    try {
      const minWindow = await this._createMinimisedWindow();
      await this._showWindow(window);
      if (minWindow) {
        await this.closeWindow(minWindow.id);
      }
      return Promise.resolve(window);
    } catch (e) {
      return this._showWindow(window);
    }
  }

  private _createMinimisedWindow() {
    return this.chromeAPI.windows.create({
      type: 'normal',
      state: 'minimized',
      url: 'chrome://version/?bananatabs-ignore',
    });
  }

  private async _showWindow(window: BT.Window): Promise<BT.Window> {
    const bounds = window.bounds;
    const createData: chrome.windows.CreateData = {
      ...bounds,
      focused: window.focused,
      type: window.type,
      url: window.tabs.filter(t => t.visible).map(t => t.url),
    };

    const newWindow = await this.chromeAPI.windows.create(createData);
    if (newWindow) {
      return { ...window, id: newWindow.id, visible: true };
    } else {
      throw new Error('Error. Failed to create window.');
    }
  }

  private async getAppWindowId(): Promise<number> {
    const appURL = this.getAppURL();
    const windows = await this.chromeAPI.windows.getAll({ populate: true });
    const window = windows.find(w => {
      return (w.tabs || []).some(t => t.url === appURL);
    });
    return window ? window.id : 0;
  }

  private async getAppWindow(): Promise<chrome.windows.Window | undefined> {
    const id = await this.getAppWindowId();
    const appWindow = (await this.chromeAPI.windows.getAll({
      populate: true,
    })).find(w => w.id === id);
    return appWindow;
  }
}

function convertWindow(w: chrome.windows.Window): BT.Window {
  return {
    id: w.id,
    title: '',
    visible: true,
    icon: '',
    tabs: (w.tabs || []).filter(t => t.incognito === false).map(convertTab),
    focused: w.focused || false,
    type: w.type,
    state: w.state,
    bounds: getWindowBounds(w),
    expanded: true,
  };
}

function convertTab(t: chrome.tabs.Tab, i: number): BT.Tab {
  return {
    id: t.id || -1,
    title: t.title || '',
    visible: true,
    icon: t.favIconUrl || '',
    index: t.index,
    listIndex: i,
    url: t.url || '',
    active: t.active,
    selected: t.selected,
    highlighted: t.highlighted,
    status: t.status || '',
  };
}

function getWindowBounds(w: chrome.windows.Window): BT.Rectangle {
  return {
    top: w.top || 0,
    left: w.left || 0,
    width: w.width || 0,
    height: w.height || 0,
  };
}

function findDisplayContainingWindow(displays: SystemDisplayInfo[], appWindow: chrome.windows.Window) {
  return displays.find(display => {
    const { top, left } = getWindowBounds(appWindow);
    const h =
      left >= display.bounds.left &&
      left < display.bounds.left + display.bounds.width;
    const v =
      top >= display.bounds.top &&
      top < display.bounds.top + display.bounds.height;
    return h && v;
  });
}

function createAppWindowBounds(
  displayBounds: BT.Rectangle,
  position: 'left' | 'right',
  fraction: 3 | 4 | 5
): BT.Rectangle {
  return {
    top: 0,
    left:
      displayBounds.left +
      (position === 'right'
        ? (displayBounds.width * (fraction - 1)) / fraction
        : 0),
    width: displayBounds.width / fraction,
    height: displayBounds.height,
  };
}
