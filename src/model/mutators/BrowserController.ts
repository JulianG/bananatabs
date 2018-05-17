import * as BT from '../CoreTypes';

// BrowserController (interface)

export default interface BrowserController {
	closeWindow(id: number): void;
	closeTab(id: number): void;
	selectTab(id: number): void;
	createTab(window: BT.Window, tab: BT.Tab): void;
	showWindow(window: BT.Window, first: boolean): void;
}

// FakeBrowserController

function getResolvingPromise() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 125);
	});
}

export class FakeBrowserController implements BrowserController {
	public closeWindow(id: number) {
		console.log(`FakeBrowserController.closeWindow(${id}) ...`);
		return getResolvingPromise();
	}
	public closeTab(id: number) {
		console.log(`FakeBrowserController.closeTab(${id}) ...`);
		return getResolvingPromise();
	}
	public selectTab(id: number) {
		console.log(`FakeBrowserController.selectTab(${id}) ...`);
		return getResolvingPromise();
	}
	public createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`FakeBrowserController.createTab(...) ...`);
		return getResolvingPromise();
	}

	public showWindow(window: BT.Window, first: boolean) {
		console.log(`FakeBrowserController.showWindow(...) ...`);
		return getResolvingPromise();
	}
}

// ChromeBrowserController

export class ChromeBrowserController implements BrowserController {

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

///

export function getBrowserController(): BrowserController {
	return (chrome && chrome.windows && chrome.tabs) ?
		new ChromeBrowserController() :
		new FakeBrowserController();
}
