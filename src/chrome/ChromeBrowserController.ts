import * as BT from '../model/CoreTypes';
import { promisify } from '../utils/Promisify';
import BrowserController from '../model/mutators/BrowserController';

// import MutedConsole from '../utils/MutedConsole';
// const console = new MutedConsole();

const chromeWindowsCreate = promisify<chrome.windows.Window>(chrome.windows.create);
const chromeWindowsUpdate = promisify(chrome.windows.update);
const chromeWindowsRemove = promisify(chrome.windows.remove);
const chromeTabsCreate = promisify<chrome.tabs.Tab>(chrome.tabs.create);
const chromeTabsUpdate = promisify(chrome.tabs.update);
const chromeTabsRemove = promisify(chrome.tabs.remove);

export default class ChromeBrowserController implements BrowserController {

	public async closeWindow(id: number) {
		console.log(`ChromeBrowserController.closeWindow(${id}) ...`);
		return chromeWindowsRemove(id);
	}

	public async closeTab(id: number) {
		console.log(`ChromeBrowserController.closeTab(${id}) ...`);
		return chromeTabsRemove(id);
	}

	public async selectTab(windowId: number, tabId: number) {
		console.log(`ChromeBrowserController.selectTab(${tabId}) ...`);
		
		const windowPromise = chromeWindowsUpdate(windowId, { focused: true });
		const tabPromise = chromeTabsUpdate(tabId, { active: true });
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
		return chromeTabsCreate(props).then(newTab => {
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
		return chromeWindowsCreate({ type: 'normal', state: 'minimized' });
	}

	private async _showWindow(window: BT.Window): Promise<BT.Window> {
		const geom = window.geometry;
		const createData: chrome.windows.CreateData = {
			...geom,
			focused: window.focused,
			type: window.type,
			url: window.tabs.filter(t => t.visible).map(t => t.url)
		};

		const newWindow = await chromeWindowsCreate(createData);

		if (newWindow) {
			window.visible = true;
			window.id = newWindow.id;
			return (window);
		} else {
			throw (new Error('Error. Failed to create window.'));
		}
	}
}