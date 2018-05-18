import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';

import MutedConsole from '../utils/MutedConsole';
const console = new MutedConsole();

export default class ChromeBrowserController implements BrowserController {

	public async closeWindow(id: number) {
		console.log(`ChromeBrowserController.closeWindow(${id}) ...`);
		return new Promise((resolve, reject) => {
			try {
				chrome.windows.remove(id, resolve);
			} catch (e) {
				reject(e);
			}
		});
	}

	public async closeTab(id: number) {
		console.log(`ChromeBrowserController.closeTab(${id}) ...`);
		return new Promise((resolve, reject) => {
			try {
				chrome.tabs.remove(id, resolve);
			} catch (e) {
				reject(e);
			}
		});

	}

	public async selectTab(id: number) {
		console.log(`ChromeBrowserController.selectTab(${id}) ...`);
		return new Promise((resolve, reject) => {
			try {
				chrome.tabs.update(id, { active: true }, t => resolve());
			} catch (e) {
				reject(e);
			}
		});
	}

	public async createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`ChromeBrowserController.createTab(...) ...`);
		return new Promise((resolve, reject) => {
			try {
				const props: chrome.tabs.CreateProperties = {
					windowId: window.visible ? window.id : 0,
					index: Math.max(tab.index, 0),
					url: tab.url,
					active: tab.active
				};
				chrome.tabs.create(props, newTab => {
					tab.id = newTab.id || -1;
					resolve();
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	public async showWindow(window: BT.Window, first: boolean) {
		console.log(`ChromeBrowserController.createTab(...) ...`);
		if (first) {
			try {
				const newWindowId = await this._createMinimisedWindow();
				await this._showWindow(window);
				return this.closeWindow(newWindowId);
			} catch (e) {
				return this._showWindow(window);
			}
		} else {
			return this._showWindow(window);
		}
	}

	/////

	private _createMinimisedWindow(): Promise<number> {
		return new Promise((resolve, reject) => {
			chrome.windows.create({ type: 'normal', state: 'minimized' }, newWindow => {
				if (newWindow) {
					resolve(newWindow.id);
				} else {
					reject();
				}
			});
		});
	}

	private _showWindow(window: BT.Window): Promise<BT.Window> {
		const geom = window.geometry;
		const createData: chrome.windows.CreateData = {
			...geom,
			focused: window.focused,
			type: window.type,
			url: window.tabs.filter(t => t.visible).map(t => t.url)
		};
		return new Promise((resolve, reject) => {
			try {
				chrome.windows.create(createData, newWindow => {
					if (newWindow) {
						window.visible = true;
						window.id = newWindow.id;
						resolve(window);
					} else {
						reject();
					}
				});
			} catch (e) {
				reject(e);
			}
		});
	}
}