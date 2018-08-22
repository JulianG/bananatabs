import {
	ChromeAPI,
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

export default class FakePromisingChromeAPI implements ChromeAPI {

	public readonly windows: ChromeWindowsAPI;
	public readonly tabs: ChromeTabsAPI;
	public readonly system: ChromeSystemAPI;
	public readonly extension: ChromeExtensionAPI;

	private fakeWindows: chrome.windows.Window[];
	private fakeIdCount: number;

	private currentTab: chrome.tabs.Tab;

	constructor(
		private fakeDisplayUnitInfoArray: chrome.system.display.DisplayUnitInfo[] = [FakeDisplayUnitInfo]
	) {

		const self = this;

		this.fakeWindows = [];
		this.fakeIdCount = 1000;

		this.windows = {

			onCreated: new FCE.WindowReferenceEvent(),
			onRemoved: new FCE.WindowIdEvent(),
			onFocusChanged: new FCE.WindowIdEvent(),

			async getAll(getInfo: chrome.windows.GetInfo): Promise<chrome.windows.Window[]> {
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
			async getCurrent() {
				return self.currentTab;
			}

		};

		this.system = {
			display: {
				async getInfo(options: {}): Promise<chrome.system.display.DisplayUnitInfo[]> {
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

	private addTabToWindow(newTab: chrome.tabs.Tab, windowId: number) {
		const win = this.fakeWindows.find(w => w.id === windowId);
		if (win) {
			if (win.tabs === undefined) {
				win.tabs = [];
			}
			win.tabs.push(newTab);
			newTab.windowId = windowId;
		} else {
			throw (new Error(`Failed to add new tab to windowId:${windowId}`));
		}
	}

	private async createWindow(createData: chrome.windows.CreateData) {
		const newWindow = this._createWindow(createData);
		this.fakeWindows.push(newWindow);
		if (createData.focused) {
			await this.focusWindow(newWindow.id, true, true);
		}
		this.normaliseActiveTabs(newWindow);

		(this.windows.onCreated as FCE.WindowReferenceEvent).fakeDispatch(newWindow);
		if (newWindow.tabs) {
			newWindow.tabs.forEach(async (tab) => {
				(this.tabs.onCreated as FCE.TabCreatedEvent).fakeDispatch(tab);
				(this.tabs.onActivated as FCE.TabActivatedEvent).fakeDispatch({ tabId: tab.id, windowId: tab.windowId });
				(this.tabs.onHighlighted as FCE.TabHighlightedEvent).fakeDispatch({ tabIds: [tab.id], windowId: tab.windowId });
			});
		}
		return newWindow;
	}

	private async updateWindow(id: number, updateInfo: chrome.windows.UpdateInfo) {
		const existingWindow = this._getWindow(id);
		if (existingWindow) {
			this._updateWindow(existingWindow, updateInfo);
			return existingWindow;
		} else {
			return Promise.reject(`failed to update window with id: ${id}`);
		}
	}

	private _createWindow(createData: chrome.windows.CreateData): chrome.windows.Window {
		const windowId = this.getNextId();

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

	private _createTabsFromURLs(windowId: number, urls: string | string[] | undefined): chrome.tabs.Tab[] {
		if (urls === undefined) {
			return [this._createTab({ windowId })];
		}
		if (Array.isArray(urls)) {
			return urls.map(url => this._createTab({ windowId, url }));
		} else {
			const url = urls;
			return [this._createTab({ windowId, url })];
		}
	}

	private async removeWindow(id: number) {

		const index = this.fakeWindows.findIndex(w => w.id === id);
		if (index > -1) {

			const win = this.fakeWindows[index];
			const tabIds = (win.tabs || []).map(t => t.id);
			const removeAllTabs = tabIds.map(tId => (tId) ? this.removeTabWhileWindowClosing(tId) : Promise.resolve());
			await Promise.all(removeAllTabs);
			this.fakeWindows.splice(index, 1);

			if (win.focused) {
				const nextFocusedWindowId = (this.fakeWindows.length >= 1) ?
					this.fakeWindows[this.fakeWindows.length - 1].id :
					-1;
				this.focusWindow(nextFocusedWindowId, true, true);
			}
			(this.windows.onRemoved as FCE.WindowIdEvent).fakeDispatch(id);

			return win;
		} else {
			throw (new Error(`failed to remove window with id: ${id}`));
		}
	}

	private _getWindow(id: number): chrome.windows.Window | undefined {
		return this.fakeWindows.find(w => w.id === id);
	}

	private _updateWindow(window: chrome.windows.Window, updateInfo: chrome.windows.UpdateInfo) {

		window.state = (updateInfo.state !== undefined) ? updateInfo.state : window.state;
		window.top = (updateInfo.top !== undefined) ? updateInfo.top : window.top;
		window.left = (updateInfo.left !== undefined) ? updateInfo.left : window.left;
		window.width = (updateInfo.width !== undefined) ? updateInfo.width : window.width;
		window.height = (updateInfo.height !== undefined) ? updateInfo.height : window.height;
		if (updateInfo.focused !== undefined) {
			this.focusWindow(window.id, updateInfo.focused, false);
		}
		return window;
	}

	private focusWindow(id: number, value: boolean, forceEventDispatch: boolean) {

		let change = false;

		if (id !== -1) {
			const window = this._getWindow(id);
			if (!window) {
				throw (new Error(`Cannot find window id: ${id}`));
			}
			change = window.focused !== value;
		}

		this.fakeWindows.forEach(w => {
			w.focused = (w.id === id) ? value : false;
		});

		if (change || forceEventDispatch) {
			(this.windows.onFocusChanged as FCE.WindowIdEvent).fakeDispatch(this.getFocusedWindowId());
		}
	}

	private getFocusedWindowId(): number {
		const focusedWindow = this.fakeWindows.find(w => w.focused);
		return (focusedWindow) ? focusedWindow.id : -1;
	}

	private async createTab(props: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
		const newTab = this._createTab(props);
		this.addTabToWindow(newTab, newTab.windowId);
		if (newTab.active && newTab.id) {
			this.setActiveTab(newTab.id, true, true);
		}
		(this.tabs.onCreated as FCE.TabCreatedEvent).fakeDispatch(newTab);
		return newTab;
	}

	private _createTab(props: chrome.tabs.CreateProperties): chrome.tabs.Tab {

		const windowId = props.windowId || this.getFocusedWindowId();
		const window = this._getWindow(windowId);
		const defaultIndex = (window) ? (window.tabs || []).length : 0;

		const tab = {
			id: this.getNextId(),
			index: props.index || defaultIndex,
			pinned: props.pinned || false,
			highlighted: false,
			windowId,
			active: props.active || true,
			incognito: false,
			selected: props.selected || false,
			discarded: false,
			autoDiscardable: false,
			url: props.url,
			openerTabId: props.openerTabId
		};

		return tab;
	}

	private async updateTab(id: number, props: chrome.tabs.UpdateProperties) {
		try {
			const tab = this._updateTab(id, props);
			(this.tabs.onUpdated as FCE.TabUpdatedEvent).fakeDispatch(id, { status: tab.status, pinned: tab.pinned });
			return tab;
		} catch (e) {
			return Promise.reject(`failed to update tab with id: ${id}`);
		}
	}

	private _updateTab(id: number, props: chrome.tabs.UpdateProperties) {
		const tab = this.getTab(id);
		if (tab) {
			tab.autoDiscardable = (props.autoDiscardable !== undefined) ? props.autoDiscardable : tab.autoDiscardable;
			tab.highlighted = (props.highlighted !== undefined) ? props.highlighted : tab.highlighted;
			tab.openerTabId = (props.openerTabId !== undefined) ? props.openerTabId : tab.openerTabId;
			tab.pinned = (props.pinned !== undefined) ? props.pinned : tab.pinned;
			tab.selected = (props.selected !== undefined) ? props.selected : tab.selected;
			tab.url = (props.url !== undefined) ? props.url : tab.url;

			if (props.active !== undefined) {
				this.setActiveTab(id, props.active, false);
			}

		} else {
			throw ('Failed to update tab id: ' + id);
		}
		return tab;
	}

	private async removeTab(id: number): Promise<void> {
		try {
			const winId = this._removeTab(id);
			(this.tabs.onRemoved as FCE.TabRemovedEvent).fakeDispatch(id, { windowId: winId, isWindowClosing: false });
			return;
		} catch (e) {
			return Promise.reject(`failed to remove tab with id: ${id}`);
		}
	}

	private _removeTab(id: number): number {
		const win = this.getWindowForTab(id);
		const index = win!.tabs!.findIndex(t => t.id === id);
		win!.tabs!.splice(index, 1);
		return win!.id;
	}

	private async removeTabWhileWindowClosing(id: number): Promise<void> {
		try {
			const winId = this._removeTab(id);
			(this.tabs.onRemoved as FCE.TabRemovedEvent).fakeDispatch(id, { windowId: winId, isWindowClosing: true });
			return;
		} catch (e) {
			return Promise.reject(`failed to remove tab with id: ${id}`);
		}
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

	private normaliseActiveTabs(window: chrome.windows.Window) {
		const tabs = window.tabs || [];
		if (tabs.length < 1) {
			return;
		}
		const activeTabs = tabs.filter(t => t.active);

		const id = (activeTabs.length) ?
			activeTabs[activeTabs.length - 1].id :
			tabs[tabs.length - 1].id;

		if (id) {
			this.setActiveTab(id, true, false);
		}

	}

	private setActiveTab(id: number, value: boolean, forceEventDispatch: boolean) {
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
			t.highlighted = t.active;
		});

		if (change && value || forceEventDispatch) {
			(this.tabs.onActivated as FCE.TabActivatedEvent).fakeDispatch({ tabId: id, windowId: tab.windowId });
			(this.tabs.onHighlighted as FCE.TabHighlightedEvent).fakeDispatch({ tabIds: [id], windowId: tab.windowId });
		}
	}

	///

	private getNextId(): number {
		return this.fakeIdCount++;
	}

}