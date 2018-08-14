import {
	ChromeAPI,
	ChromeWindowsAPI,
	ChromeTabsAPI,
	ChromeSystemAPI,
	ChromeExtensionAPI
} from './PromisingChromeAPI';
import FakeChromeEvent from './FakeChromeEvent';

class WindowReferenceEvent
	extends FakeChromeEvent<(window: chrome.windows.Window, filters?: chrome.windows.WindowEventFilter) => void> { }
class WindowIdEvent
	extends FakeChromeEvent<((windowId: number, filters?: chrome.windows.WindowEventFilter | undefined) => undefined)> { }
// class TabHighlightedEvent extends FakeChromeEvent<(highlightInfo: chrome.tabs.HighlightInfo) => void> { }
class TabRemovedEvent
	extends FakeChromeEvent<(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => void> { }
class TabUpdatedEvent
	extends FakeChromeEvent<(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void> { }
class TabAttachedEvent
	extends FakeChromeEvent<(tabId: number, attachInfo: chrome.tabs.TabAttachInfo) => void> { }
class TabMovedEvent
	extends FakeChromeEvent<(tabId: number, moveInfo: chrome.tabs.TabMoveInfo) => void> { }
// class TabDetachedEvent extends FakeChromeEvent<(tabId: number, detachInfo: chrome.tabs.TabDetachInfo) => void> { }
class TabCreatedEvent
	extends FakeChromeEvent<(tab: chrome.tabs.Tab) => void> { }
class TabActivatedEvent
	extends FakeChromeEvent<(activeInfo: chrome.tabs.TabActiveInfo) => void> { }
// class TabReplacedEvent extends FakeChromeEvent<(addedTabId: number, removedTabId: number) => void> { }
// class TabSelectedEvent extends FakeChromeEvent<(tabId: number, selectInfo: chrome.tabs.TabWindowInfo) => void> { }
// class TabZoomChangeEvent extends FakeChromeEvent<(ZoomChangeInfo: chrome.tabs.ZoomChangeInfo) => void> { }

const FakeDisplayUnitInfo: chrome.system.display.DisplayUnitInfo = {
	id: 'fake-display',
	name: 'FakeDisplay',
	isPrimary: true,
	isEnabled: true,
	bounds: { top: 0, left: 0, width: 1920, height: 1040 },
	workArea: { top: 0, left: 0, width: 1920, height: 1040 }
};

export default class FakePromisingChromeAPI implements ChromeAPI {

	public readonly windows: ChromeWindowsAPI;
	public readonly tabs: ChromeTabsAPI;
	public readonly system: ChromeSystemAPI;
	public readonly extension: ChromeExtensionAPI;

	private fakeDisplayUnitInfoArray: chrome.system.display.DisplayUnitInfo[];

	private fakeWindows: chrome.windows.Window[];
	private fakeIdCount: number;

	private currentTab: chrome.tabs.Tab;

	constructor(fakeDisplayUnitInfoArray: chrome.system.display.DisplayUnitInfo[] = [FakeDisplayUnitInfo]) {

		const self = this;

		this.fakeWindows = [];
		this.fakeIdCount = 1000;
		this.fakeDisplayUnitInfoArray = fakeDisplayUnitInfoArray;

		this.windows = {

			onCreated: new WindowReferenceEvent(),
			onRemoved: new WindowIdEvent(),
			onFocusChanged: new WindowIdEvent(),

			async getAll(getInfo: chrome.windows.GetInfo): Promise<chrome.windows.Window[]> {
				await self.delay();
				return self.fakeWindows;
			},
			async create(createData: chrome.windows.CreateData): Promise<chrome.windows.Window | undefined> {
				const newWindow = self.createWindow(createData);
				await self.delay();
				(this.onCreated as WindowReferenceEvent).fakeDispatch(newWindow);
				return newWindow;
			},
			async update(id: number, updateInfo: chrome.windows.UpdateInfo): Promise<chrome.windows.Window> {
				const existingWindow = self.getWindow(id);
				if (existingWindow) {
					await self.delay();
					self.updateWindow(existingWindow, updateInfo);
					return existingWindow;
				} else {
					return Promise.reject(`failed to update window with id: ${id}`);
				}
			},
			async remove(id: number): Promise<void> {
				const index = self.fakeWindows.findIndex(w => w.id === id);
				await self.delay();
				if (index > -1) {
					self.fakeWindows.splice(index, 1);
					(this.onRemoved as WindowIdEvent).fakeDispatch(id);
					return;
				} else {
					return Promise.reject(`failed to remove window with id: ${id}`);
				}
			}

		};

		this.tabs = {

			onActivated: new TabActivatedEvent(),
			onAttached: new TabAttachedEvent(), // never triggered!
			onCreated: new TabCreatedEvent(),
			onMoved: new TabMovedEvent(), // never triggered!
			onRemoved: new TabRemovedEvent(),
			onUpdated: new TabUpdatedEvent(),

			async create(props: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
				await self.delay();
				const newTab = self.createTab(props);
				(this.onCreated as TabCreatedEvent).fakeDispatch(newTab);
				return newTab;
			},
			async update(id: number, props: chrome.tabs.UpdateProperties) {
				await self.delay();
				try {
					const tab = self.updateTab(id, props);
					(this.onUpdated as TabUpdatedEvent).fakeDispatch(id);
					return tab;
				} catch (e) {
					return Promise.reject(`failed to update tab with id: ${id}`);
				}
			},
			async remove(id: number) {
				await self.delay();
				try {
					const win = self.getWindowForTab(id);
					const index = win!.tabs!.findIndex(t => t.id === id);
					win!.tabs!.splice(index, 1);
					(this.onRemoved as TabRemovedEvent).fakeDispatch(id);
					return;
				} catch (e) {
					return Promise.reject(`failed to remove tab with id: ${id}`);
				}
			},
			async getCurrent() {
				await self.delay();
				return self.currentTab;
			}

		};

		this.system = {
			display: {
				async getInfo(options: {}): Promise<chrome.system.display.DisplayUnitInfo[]> {
					await self.delay();
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

	private createWindow(createData: chrome.windows.CreateData): chrome.windows.Window {
		return {
			id: this.getNextId(),
			state: createData.state || 'normal',
			focused: createData.focused || false,
			alwaysOnTop: false,
			incognito: createData.incognito || false,
			type: createData.type || 'normal',
			tabs: [],
			top: createData.top,
			left: createData.left,
			width: createData.width,
			height: createData.height
		};
	}

	private getWindow(id: number): chrome.windows.Window | undefined {
		return this.fakeWindows.find(w => w.id === id);
	}

	private updateWindow(window: chrome.windows.Window, updateInfo: chrome.windows.UpdateInfo) {

		window.state = (updateInfo.state !== undefined) ? updateInfo.state : window.state;
		window.top = (updateInfo.top !== undefined) ? updateInfo.top : window.top;
		window.left = (updateInfo.left !== undefined) ? updateInfo.left : window.left;
		window.width = (updateInfo.width !== undefined) ? updateInfo.width : window.width;
		window.height = (updateInfo.height !== undefined) ? updateInfo.height : window.height;
		if (updateInfo.focused !== undefined) {
			this.focusWindow(window.id, updateInfo.focused);
		}
		return window;
	}

	private focusWindow(id: number, value: boolean) {
		const window = this.getWindow(id);
		if (!window) {
			throw (new Error(`Cannot find window id: ${id}`));
		}

		const change = window.focused !== value;

		this.fakeWindows.forEach(w => {
			w.focused = (w.id === id) ? value : false;
		});

		if (change) {
			(this.windows.onFocusChanged as WindowIdEvent).fakeDispatch(this.getFocusedWindowId());
		}
	}

	private getFocusedWindowId(): number {
		const focusedWindow = this.fakeWindows.find(w => w.focused);
		return (focusedWindow) ? focusedWindow.id : -1;
	}

	private createTab(props: chrome.tabs.CreateProperties): chrome.tabs.Tab {

		const windowId = props.windowId || this.getFocusedWindowId();
		const window = this.getWindow(windowId);
		const defaultIndex = (window) ? (window.tabs || []).length : 0;

		return {
			id: this.getNextId(),
			index: props.index || defaultIndex,
			pinned: props.pinned || false,
			highlighted: false,
			windowId,
			active: props.active || false,
			incognito: false,
			selected: props.selected || false,
			discarded: false,
			autoDiscardable: false,
			url: props.url,
			openerTabId: props.openerTabId
		};
	}

	private updateTab(id: number, props: chrome.tabs.UpdateProperties) {
		const tab = this.getTab(id);
		if (tab) {
			tab.autoDiscardable = (props.autoDiscardable !== undefined) ? props.autoDiscardable : tab.autoDiscardable;
			tab.highlighted = (props.highlighted !== undefined) ? props.highlighted : tab.highlighted;
			tab.openerTabId = (props.openerTabId !== undefined) ? props.openerTabId : tab.openerTabId;
			tab.pinned = (props.pinned !== undefined) ? props.pinned : tab.pinned;
			tab.selected = (props.selected !== undefined) ? props.selected : tab.selected;
			tab.url = (props.url !== undefined) ? props.url : tab.url;

			if (props.active !== undefined) {
				this.setActiveTab(id, props.active);
			}

		} else {
			throw ('Failed to update tab id: ' + id);
		}
		return tab;
	}

	private getTab(id: number): chrome.tabs.Tab | undefined {
		const window = this.getWindowForTab(id);
		return (window) ? window.tabs!.find(t => t.id === id)! : undefined;
	}

	private getWindowForTab(tabId: number): chrome.windows.Window | undefined {
		return this.fakeWindows.find(w => {
			return (w.tabs || []).find(t => {
				return t.id === tabId;
			}) !== undefined;
		});
	}

	private setActiveTab(id: number, value: boolean) {
		const tab = this.getTab(id);
		if (!tab) {
			throw (new Error(`Cannot find tab by id: ${id}`));
		}
		const window = this.getWindowForTab(id);
		if (!window) {
			throw (new Error(`Cannot find a window containing tab id: ${id}`));
		}

		const change = tab.active !== value;

		window.tabs!.forEach(t => {
			t.active = (t.id === id) ? value : false;
		});

		if (change && value) {
			(this.tabs.onActivated as TabActivatedEvent).fakeDispatch(id);
		}
	}

	///

	private getNextId(): number {
		return this.fakeIdCount++;
	}

	private delay(minimumDelay: number = 0): Promise<void> {
		return new Promise((resolve, reject) => {
			setTimeout(() => { resolve(); }, minimumDelay + 1 + Math.random() / 10);
		});
	}

}