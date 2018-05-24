import * as BT from '../model/CoreTypes';
import { PromisingChromeAPI } from './PromisingChromeAPI';
import BrowserController from '../model/mutators/BrowserController';

import MutedConsole from '../utils/MutedConsole';
const console = new MutedConsole();

export default class ChromeBrowserController implements BrowserController {

	public async closeWindow(id: number) {
		console.log(`ChromeBrowserController.closeWindow(${id}) ...`);
		return PromisingChromeAPI.windows.remove(id);
	}

	public async closeTab(id: number) {
		console.log(`ChromeBrowserController.closeTab(${id}) ...`);
		return PromisingChromeAPI.tabs.remove(id);
	}

	public async selectTab(windowId: number, tabId: number) {
		console.log(`ChromeBrowserController.selectTab(${tabId}) ...`);

		const windowPromise = PromisingChromeAPI.windows.update(windowId, { focused: true });
		const tabPromise = PromisingChromeAPI.tabs.update(tabId, { active: true });
		return Promise.all([windowPromise, tabPromise]);
	}

	public async createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`ChromeBrowserController.createTab(...) ...`);
		const props: chrome.tabs.CreateProperties = {
			windowId: window.visible ? window.id : 0,
			index: Math.max(tab.index, 0),
			url: tab.url,
			active: tab.active
		};
		return PromisingChromeAPI.tabs.create(props).then(newTab => {
			tab.id = newTab.id || -1;
		});
	}

	public async showWindow(window: BT.Window) {

		const liveWindows = await PromisingChromeAPI.windows.getAll({});
		const asFirst = liveWindows.length <= 1;
		console.log(`ChromeBrowserController.showWindow(...) ...`);
		if (asFirst) {
			return this._showWindowAsFirst(window);
		} else {
			return this._showWindow(window);
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
		return PromisingChromeAPI.windows.create({ type: 'normal', state: 'minimized' });
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