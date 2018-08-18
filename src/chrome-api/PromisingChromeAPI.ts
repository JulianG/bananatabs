/*
tslint:disable no-any
*/
import { promisify } from '../utils/Promisify';
import FakePromisingChromeAPI from './FakePromisingChromeAPI';

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
	const winsGetAll = promisify<chrome.windows.Window[]>(chrome.windows.getAll);
	const winsCreate = promisify<chrome.windows.Window | undefined>(chrome.windows.create);
	const winsRemove = promisify<void>(chrome.windows.remove);
	const winsUpdate = promisify<chrome.windows.Window>(chrome.windows.update);
	const tabsCreate = promisify<chrome.tabs.Tab>(chrome.tabs.create);
	const tabsUpdate = promisify<chrome.tabs.Tab | undefined>(chrome.tabs.update);
	const tabsRemove = promisify<void>(chrome.tabs.remove);
	const tabsGetCurrent = promisify<chrome.tabs.Tab>(chrome.tabs.getCurrent);
	const systemDisplayGetInfo = promisify<chrome.system.display.DisplayUnitInfo[]>(chrome.system.display.getInfo);

	PromisingChromeAPI = {
		windows: {
			onCreated: chrome.windows.onCreated,
			onRemoved: chrome.windows.onRemoved,
			onFocusChanged: chrome.windows.onFocusChanged,
			getAll: (getInfo: chrome.windows.GetInfo) => winsGetAll(getInfo),
			create: (createData: chrome.windows.CreateData) => winsCreate(createData),
			update: (id: number, updateInfo: chrome.windows.UpdateInfo) => winsUpdate(id, updateInfo),
			remove: (id: number) => winsRemove(id)
		},
		tabs: {
			onActivated: chrome.tabs.onActivated,
			onAttached: chrome.tabs.onAttached,
			onCreated: chrome.tabs.onCreated,
			onMoved: chrome.tabs.onMoved,
			onRemoved: chrome.tabs.onRemoved,
			onUpdated: chrome.tabs.onUpdated,
			onHighlighted: chrome.tabs.onHighlighted,
			create: (props: chrome.tabs.CreateProperties) => tabsCreate(props),
			update: (id: number, props: chrome.tabs.UpdateProperties) => tabsUpdate(id, props),
			remove: (id: number) => tabsRemove(id),
			getCurrent: () => tabsGetCurrent()
		},
		system: {
			display: {
				getInfo: (options: {}) => systemDisplayGetInfo(options)
			}
		},
		extension: {
			getURL: (path: string) => {
				return '/' + path;
			}
		}
	};

} else {
	console.warn('using FakePromisingChromeAPI');
	PromisingChromeAPI = new FakePromisingChromeAPI();
}

export default PromisingChromeAPI;