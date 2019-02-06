import {
  PromisingChromeAPI,
  ChromeWindowsAPI,
  ChromeTabsAPI,
  ChromeSystemAPI,
  ChromeExtensionAPI,
} from './PromisingChromeAPI';

import { promisify } from '../utils/Promisify';

export class RealPromisingChromeAPI implements PromisingChromeAPI {
  public readonly windows: ChromeWindowsAPI;
  public readonly tabs: ChromeTabsAPI;
  public readonly system: ChromeSystemAPI;
  public readonly extension: ChromeExtensionAPI;

  constructor() {
    this.windows = {
      onCreated: chrome.windows.onCreated,
      onRemoved: chrome.windows.onRemoved,
      onFocusChanged: chrome.windows.onFocusChanged,

      getAll: promisify<chrome.windows.Window[]>(chrome.windows.getAll),
      create: promisify<chrome.windows.Window | undefined>(
        chrome.windows.create
      ),
      update: promisify<chrome.windows.Window>(chrome.windows.update),
      remove: promisify<void>(chrome.windows.remove),
    };

    this.tabs = {
      onActivated: chrome.tabs.onActivated,
      onAttached: chrome.tabs.onAttached,
      onCreated: chrome.tabs.onCreated,
      onMoved: chrome.tabs.onMoved,
      onRemoved: chrome.tabs.onRemoved,
      onUpdated: chrome.tabs.onUpdated,
      onHighlighted: chrome.tabs.onHighlighted,
      create: promisify<chrome.tabs.Tab>(chrome.tabs.create),
      update: promisify<chrome.tabs.Tab | undefined>(chrome.tabs.update),
      remove: promisify<void>(chrome.tabs.remove),
      move: promisify<chrome.tabs.Tab | chrome.tabs.Tab[]>(chrome.tabs.move),
      getCurrent: promisify<chrome.tabs.Tab>(chrome.tabs.getCurrent),
    };

    this.system = {
      display: {
        getInfo: promisify<chrome.system.display.DisplayUnitInfo[]>(
          chrome.system.display.getInfo
        ),
      },
    };

    this.extension = {
      getURL: (path: string) => {
        return chrome.extension.getURL(path);
      },
    };
  }
}
