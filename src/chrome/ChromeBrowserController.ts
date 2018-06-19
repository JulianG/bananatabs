import * as BT from '../model/CoreTypes';
import { PromisingChromeAPI } from './PromisingChromeAPI';
import BrowserController from '../model/mutators/BrowserController';
import ChromeEventHandler from './ChromeEventHandler';

import console from '../utils/MutedConsole';

export default class ChromeBrowserController implements BrowserController {

	private events: ChromeEventHandler;

	constructor() {
		this.events = new ChromeEventHandler();
	}

	public async closeWindow(id: number) {
		console.log(`ChromeBrowserController.closeWindow(${id}) ...`);
		this.events.disable();
		try {
			await PromisingChromeAPI.windows.remove(id);
		} catch (e) {
			console.warn(`Could not delete window for real... ${id}`);
			console.warn(e);
		}
		this.events.enable();
	}

	public async closeTab(id: number) {
		console.log(`ChromeBrowserController.closeTab(${id}) ...`);
		this.events.disable();
		await PromisingChromeAPI.tabs.remove(id);
		this.events.enable();
	}

	public async selectTab(windowId: number, tabId: number) {
		console.log(`ChromeBrowserController.selectTab(${tabId}) ...`);
		this.events.disable();
		const windowPromise = PromisingChromeAPI.windows.update(windowId, { focused: true });
		const tabPromise = PromisingChromeAPI.tabs.update(tabId, { active: true });
		await Promise.all([windowPromise, tabPromise]);
		this.events.enable();
	}

	public async createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`ChromeBrowserController.createTab(...) ...`);
		this.events.disable();
		const props: chrome.tabs.CreateProperties = {
			windowId: window.visible ? window.id : 0,
			index: Math.max(tab.index, 0),
			url: tab.url,
			active: tab.active
		};
		const newTab = await PromisingChromeAPI.tabs.create(props);
		tab.id = newTab.id || -1;
		this.events.enable();
	}

	public async showWindow(window: BT.Window) {
		this.events.disable();
		const liveWindows = await PromisingChromeAPI.windows.getAll({});
		const asFirst = liveWindows.length <= 1;
		console.log(`ChromeBrowserController.showWindow(...) ...`);
		if (asFirst) {
			await this._showWindowAsFirst(window);
		} else {
			await this._showWindow(window);
		}
		this.events.enable();
	}

	public async getAllWindows(): Promise<BT.Window[]> {
		this.events.disable();
		const wins = await PromisingChromeAPI.windows.getAll({ populate: true });
		this.events.enable();
		return wins.map(convertWindow);
	}

	/////

	public addEventListener(listener: (event: string, reason?: string) => void) {
		this.events.addEventListener(listener);
	}

	public removeEventListener(listener: (event: string, reason?: string) => void) {
		this.events.removeEventListener(listener);
	}

	public getAppURL(): string {
		return chrome.extension.getURL('index.html');
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
		return PromisingChromeAPI.windows.create({
			type: 'normal',
			state: 'minimized',
			url: 'chrome://version/?bananatabs-ignore'
		});
	}

	private async _showWindow(window: BT.Window): Promise<BT.Window> {
		const geom = window.geometry;
		const createData: chrome.windows.CreateData = {
			...geom,
			focused: window.focused,
			type: window.type,
			url: window.tabs.filter(t => t.visible).map(t => t.url)
		};

		const newWindow = await PromisingChromeAPI.windows.create(createData);

		if (newWindow) {
			window.visible = true;
			window.id = newWindow.id;
			return (window);
		} else {
			throw (new Error('Error. Failed to create window.'));
		}
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
		geometry: getWindowGeometry(w),
		expanded: true
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
		active: t.active
	};
}

function getWindowGeometry(w: chrome.windows.Window): BT.Geometry {
	return { top: w.top || 0, left: w.left || 0, width: w.width || 0, height: w.height || 0 };
}