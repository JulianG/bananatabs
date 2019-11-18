export interface PromisingChromeAPI {
  windows: ChromeWindowsAPI;
  tabs: ChromeTabsAPI;
  system: ChromeSystemAPI;
  extension: ChromeExtensionAPI;
}

export interface ChromeWindowsAPI {
  onCreated: chrome.windows.WindowReferenceEvent;
  onRemoved: chrome.windows.WindowIdEvent;
  onFocusChanged: chrome.windows.WindowIdEvent;
  getAll(getInfo: chrome.windows.GetInfo): Promise<chrome.windows.Window[]>;
  create(
    createData: chrome.windows.CreateData
  ):
    | Promise<chrome.windows.Window | undefined>
    | chrome.windows.Window
    | undefined;
  update(
    id: number,
    updateInfo: chrome.windows.UpdateInfo
  ): Promise<chrome.windows.Window> | chrome.windows.Window;
  remove(id: number): Promise<void> | void;
}

export interface ChromeTabsAPI {
  onCreated: chrome.tabs.TabCreatedEvent;
  onUpdated: chrome.tabs.TabUpdatedEvent;
  onMoved: chrome.tabs.TabMovedEvent;
  onAttached: chrome.tabs.TabAttachedEvent;
  onRemoved: chrome.tabs.TabRemovedEvent;
  onActivated: chrome.tabs.TabActivatedEvent;
  onHighlighted: chrome.tabs.TabHighlightedEvent;
  create(
    props: chrome.tabs.CreateProperties
  ): Promise<chrome.tabs.Tab> | chrome.tabs.Tab;
  update(
    id: number,
    props: chrome.tabs.UpdateProperties
  ): Promise<chrome.tabs.Tab | undefined> | chrome.tabs.Tab | undefined;
  remove(id: number): Promise<void> | void;
  move(
    tabIds: number,
    moveProperties: chrome.tabs.MoveProperties
  ): Promise<chrome.tabs.Tab | chrome.tabs.Tab[]> | void;
  getCurrent(): Promise<chrome.tabs.Tab>;
}

export interface ChromeSystemAPI {
  display: ChromeSystemDisplayAPI;
}

export interface ChromeSystemDisplayAPI {
  getInfo(options: {}): Promise<chrome.system.display.DisplayUnitInfo[]>;
}

export interface ChromeExtensionAPI {
  getURL(path: string): string;
}
