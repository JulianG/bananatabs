import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';
import WindowMutator from './WindowMutator';
import BrowserController from './BrowserController';

// import console from '../../utils/MutedConsole';

export default class WindowAndTabMutator implements TabMutator, WindowMutator {

	constructor(private provider: SessionProvider, private browser: BrowserController) {
	}

	// TabMutator and WindowMutator interfaces

	async renameWindow(id: number, title: string) {
		const win = this.provider.getWindow(id) || BT.NullWindow;
		win.title = title;
		await this.storeSession();
	}

	// TabMutator interface

	async selectTab(winId: number, tabId: number) {
		const win = this.provider.getWindow(winId);
		const tab = this.provider.getTab(tabId);
		if (win && tab) {
			win.tabs.forEach(t => t.active = t === tab);
			await this.storeSession();
			this.safeBrowserCall(async () => {
				await this.browser.selectTab(win.id, tab.id);
			});
		}
	}

	toggleTabVisibility(winId: number, tabId: number) {
		const tab = this.provider.getTab(tabId);
		if (tab) {
			(tab.visible) ?
				this.hideTab(winId, tabId) :
				this.showTab(winId, tabId);
		}
	}

	async hideTab(winId: number, tabId: number) {
		const win = this.provider.getWindow(winId);
		const tab = this.provider.getTab(tabId);
		if (win && tab) {
			tab.visible = false;
			this.storeSession();
			if (win.visible) {
				this.safeRenameWindow(win);
				await this.storeSession();
				await this.safeBrowserCall(async () => {
					await this.browser.closeTab(tab.id);
				});
			}
			this.dispatchSessionChange();
		}
	}

	async showTab(winId: number, tabId: number) {
		const win = this.provider.getWindow(winId);
		const tab = this.provider.getTab(tabId);
		if (win && tab) {
			tab.visible = true;
			await this.storeSession();
			this.dispatchSessionChange();
			if (win.visible) {
				await this.safeBrowserCall(async () => {
					await this.browser.createTab(win, tab);
				});
			} else {
				this._showWindow(win);
			}
		}
	}

	async deleteTab(winId: number, tabId: number) {
		const win = this.provider.getWindow(winId);
		const tab = this.provider.getTab(tabId);
		if (win && tab) {
			const tabIndex = win.tabs.indexOf(tab);
			console.assert(tabIndex >= 0);
			win.tabs.splice(tabIndex, 1);
			if (win.visible && tab.visible) {
				this.safeRenameWindow(win);
				await this.safeBrowserCall(async () => {
					await this.browser.closeTab(tab.id);
				});
			}
			await this.storeSession();
		}
	}

	/// WindowMutator

	async collapseWindow(id: number) {
		console.log('WindowAndTabMutator.collapseWindow ' + id);
		const win = this.provider.getWindow(id);
		if (win) {
			win.expanded = false;
			console.log('collapseWindow before storeSession');
			await this.storeSession();
			console.log('collapseWindow after storeSession');
			console.log('collapseWindow before dispatchSessionChange');
			await this.dispatchSessionChange();
			console.log('collapseWindow after dispatchSessionChange');
		}
	}

	async expandWindow(id: number) {
		const win = this.provider.getWindow(id);
		if (win) {
			win.expanded = true;
			await this.storeSession();
			await this.dispatchSessionChange();
		}
	}

	async toggleWindowVisibility(id: number) {
		const win = this.provider.getWindow(id);
		if (win) {
			if (win.visible) {
				await this._hideWindow(win);
			} else {
				await this._showWindow(win);
			}
			this.dispatchSessionChange();
		}
	}

	async hideWindow(id: number) {
		const win = this.provider.getWindow(id);
		if (win) {
			await this._hideWindow(win);
			this.dispatchSessionChange();
		}
	}

	async showWindow(id: number) {
		const win = this.provider.getWindow(id);
		if (win) {
			await this._showWindow(win);
			this.dispatchSessionChange();
		}
	}

	async deleteWindow(id: number) {
		const win = this.provider.getWindow(id);
		if (win) {
			const index = this.provider.session.windows.indexOf(win);
			console.assert(index >= 0);
			this.provider.session.windows.splice(index, 1);
			await this.storeSession();
			if (win.visible) {
				await this.safeBrowserCall(async () => {
					await this.browser.closeWindow(win.id);
				});
			}
			this.dispatchSessionChange();
		}
	}

	///

	private async _hideWindow(window: BT.Window) {
		this.safeRenameWindow(window);
		window.visible = false;
		await this.storeSession();
		await this.safeBrowserCall(async () => {
			await this.safeBrowserCall(async () => {
				await this.browser.closeWindow(window.id);
			});
		});
	}

	private async _showWindow(window: BT.Window) {
		window.visible = true;
		await this.storeSession();
		await this.safeBrowserCall(async () => {
			await this.browser.showWindow(window);
		});
	}

	///

	private safeRenameWindow(window: BT.Window) {
		window.title = window.title.length > 0 ? window.title : 'My Window';
	}

	private storeSession() {
		console.table(this.provider.session.windows);
		this.provider.storeSession(this.provider.session);
	}

	private dispatchSessionChange() {
		this.provider.onSessionChanged(this.provider.session);
	}

	//////////////////////
	//////////////////////
	//////////////////////
	//////////////////////
	private async safeBrowserCall(f: () => void) {
		this.provider.unhookBrowserEvents();
		await f();
		this.provider.hookBrowserEvents();
	}

}