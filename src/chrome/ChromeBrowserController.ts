import * as BT from '../model/CoreTypes';
import { makePromise } from './Promisify';
import BrowserController from '../model/mutators/BrowserController';

// import MutedConsole from '../utils/MutedConsole';
// const console = new MutedConsole();

export default class ChromeBrowserController implements BrowserController {

	public async closeWindow(id: number) {
		console.log(`ChromeBrowserController.closeWindow(${id}) ...`);
		return makePromise(chrome.windows.remove, id);
	}

	public async closeTab(id: number) {
		console.log(`ChromeBrowserController.closeTab(${id}) ...`);
		return makePromise(chrome.tabs.remove, id);
	}

	public async selectTab(windowId: number, tabId: number) {
		console.log(`ChromeBrowserController.selectTab(${tabId}) ...`);

		const windowPromise = makePromise(chrome.windows.update, windowId, { focused: true });
		const tabPromise = makePromise(chrome.tabs.update, tabId, { active: true });
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
		return makePromise<chrome.tabs.Tab>(chrome.tabs.create, props).then(newTab => {
			tab.id = newTab.id || -1;
		});
	}

	public async showWindow(window: BT.Window, first: boolean) {
		console.log(`ChromeBrowserController.createTab(...) ...`);
		if (first) {
			try {
				const newWindow = await this._createMinimisedWindow();
				await this._showWindow(window);
				return this.closeWindow(newWindow.id);
			} catch (e) {
				return this._showWindow(window);
			}
		} else {
			return this._showWindow(window);
		}
	}

	/////

	private _createMinimisedWindow(): Promise<chrome.windows.Window> {
		return makePromise(chrome.windows.create, { type: 'normal', state: 'minimized' });
	}

	private async _showWindow(window: BT.Window): Promise<BT.Window> {
		const geom = window.geometry;
		const createData: chrome.windows.CreateData = {
			...geom,
			focused: window.focused,
			type: window.type,
			url: window.tabs.filter(t => t.visible).map(t => t.url)
		};
		// return promisify(chrome.windows.create, createData);

		const newWindow = await makePromise<chrome.windows.Window>(chrome.windows.create, createData);

		if (newWindow) {
			window.visible = true;
			window.id = newWindow.id;
			return (window);
		} else {
			throw( new Error('Error. Failed to create window.'));
		}

		// return new Promise((resolve, reject) => {
		// 	try {
		// 		chrome.windows.create(createData, newWindow => {
		// 			if (newWindow) {
		// 				window.visible = true;
		// 				window.id = newWindow.id;
		// 				resolve(window);
		// 			} else {
		// 				reject();
		// 			}
		// 		});
		// 	} catch (e) {
		// 		reject(e);
		// 	}
		// });
	}
}