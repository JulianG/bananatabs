
import FakePromisingChromeAPI from './FakePromisingChromeAPI';
import RealPromisingChromeAPI from './RealPromisingChromeAPI';

export interface ChromeAPI {
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
	create(createData: chrome.windows.CreateData): Promise<chrome.windows.Window | undefined>;
	update(id: number, updateInfo: chrome.windows.UpdateInfo): Promise<chrome.windows.Window>;
	remove(id: number): Promise<void>;
}

export interface ChromeTabsAPI {
	onCreated: chrome.tabs.TabCreatedEvent;
	onUpdated: chrome.tabs.TabUpdatedEvent;
	onMoved: chrome.tabs.TabMovedEvent;
	onAttached: chrome.tabs.TabAttachedEvent;
	onRemoved: chrome.tabs.TabRemovedEvent;
	onActivated: chrome.tabs.TabActivatedEvent;
	onHighlighted: chrome.tabs.TabHighlightedEvent;
	create(props: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab>;
	update(id: number, props: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab | undefined>;
	remove(id: number): Promise<void>;
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

let PromisingChromeAPI: ChromeAPI;

if (chrome && chrome.windows) {
	PromisingChromeAPI = new RealPromisingChromeAPI();
} else {
	PromisingChromeAPI = new FakePromisingChromeAPI();
}

export default PromisingChromeAPI;