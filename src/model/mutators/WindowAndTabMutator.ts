import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';
import WindowMutator from './WindowMutator';
import BrowserController from './BrowserController';

// import MutedConsole from '../../utils/MutedConsole';
// const console = new MutedConsole();
import * as Logging from '../../utils/Logging';

export default class WindowAndTabMutator implements TabMutator, WindowMutator {

	constructor(private provider: SessionProvider, private browser: BrowserController) {
	}

	// TabMutator and WindowMutator interfaces

	async renameItem(item: BT.ListItem, title: string) {
		item.title = title;
		await this.storeSession();
	}

	// TabMutator interface

	async selectTab(window: BT.Window, tab: BT.Tab) {
		console.log(`WindowAndTabMutator.selectTab: ${tab.id}`);
		window.tabs.forEach(t => t.active = t === tab);
		await this.storeSession();
		this.safeBrowserCall(async () => {
			await this.browser.selectTab(window.id, tab.id);
		});
	}

	toggleTabVisibility(window: BT.Window, tab: BT.Tab) {
		(tab.visible) ?
			this.hideTab(window, tab) :
			this.showTab(window, tab);
	}

	async hideTab(window: BT.Window, tab: BT.Tab) {
		console.log(`WindowAndTabMutator.hideTab:`);
		tab.visible = false;
		this.storeSession();
		if (window.visible) {
			this.safeRenameWindow(window);
			await this.storeSession();
			await this.safeBrowserCall(async () => {
				await this.browser.closeTab(tab.id);
			});
			tab.id = -1; // why?
		}
		this.dispatchSessionChange();
	}

	async showTab(window: BT.Window, tab: BT.Tab) {
		tab.visible = true;
		await this.storeSession();
		this.dispatchSessionChange();
		if (window.visible) {
			await this.safeBrowserCall(async () => {
				await this.browser.createTab(window, tab);
			});
		} else {
			this._showWindow(window);
		}
	}

	async deleteTab(window: BT.Window, tab: BT.Tab) {
		const tabIndex = window.tabs.indexOf(tab);
		console.assert(tabIndex >= 0);
		window.tabs.splice(tabIndex, 1);
		if (window.visible && tab.visible) {
			this.safeRenameWindow(window);
			await this.safeBrowserCall(async () => {
				await this.browser.closeTab(tab.id);
			});
		}
		await this.storeSession();
	}

	/// WindowMutator

	async collapseWindow(window: BT.Window) {
		window.expanded = false;
		await this.storeSession();
		await this.dispatchSessionChange();
	}

	async expandWindow(window: BT.Window) {
		window.expanded = true;
		await this.storeSession();
		await this.dispatchSessionChange();
	}

	async toggleWindowVisibility(id: number) {
		const window = this.provider.getWindow(id);
		if (window) {
			console.log(`toggleWindowVisibility ${window.id}, ${window.title}: 
		window was: ${window.visible ? 'visible' : 'not visible'}`);
			if (window.visible) {
				console.log(`toggleWindowVisibility before _hideWindow`);
				await this._hideWindow(window);
				console.log(`toggleWindowVisibility after _hideWindow`);
			} else {
				await this._showWindow(window);
			}
			console.log(`toggleWindowVisibility dispatching session change`);
			this.dispatchSessionChange();
		}
	}

	async hideWindow(window: BT.Window) {
		await this._hideWindow(window);
		this.dispatchSessionChange();
	}

	async showWindow(window: BT.Window) {
		await this._showWindow(window);
		this.dispatchSessionChange();
	}

	async deleteWindow(window: BT.Window) {
		console.log(`deleteWindow ${window.id}, ${window.title}, ${window.visible}`);
		const index = this.provider.session.windows.indexOf(window);
		console.assert(index >= 0);
		this.provider.session.windows.splice(index, 1);
		console.log(`deleteWindow before storeSession`);
		await this.storeSession();
		console.log(`deleteWindow after storeSession`);
		if (window.visible) {
			console.log(`deleteWindow before browser.closeWindow`);
			await this.safeBrowserCall(async () => {
				await this.browser.closeWindow(window.id);
			});
			console.log(`deleteWindow after browser.closeWindow`);
		}

		console.log(`deleteWindow! dispatchSessionChange`);

		console.table(this.provider.session.windows.map(w => {
			return {
				id: w.id,
				title: w.title,
				visible: w.visible,
				tabs: w.tabs.length
			};
		}));

		this.dispatchSessionChange();
	}

	///

	private async _hideWindow(window: BT.Window) {
		this.safeRenameWindow(window);
		window.visible = false;
		console.log(`_hideWindow ${window.id} before`);
		Logging.printSession(this.provider.session);
		await this.storeSession();
		console.log(`_hideWindow ${window.id} after storeSession`);
		await this.safeBrowserCall(async () => {
			await this.safeBrowserCall(async () => {
				await this.browser.closeWindow(window.id);
			});
			console.log(`_hideWindow ${window.id} after browser.closeWindow`);
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
		const newTitle = window.title.length > 0 ? window.title : 'My Window ' + Math.floor(Math.random() * 1000);
		console.log(`safeRenameWindow: ${window.id} - before: ${window.title} + after: ${newTitle}`);
		window.title = newTitle;
	}

	private storeSession() {
		this.provider.storeSession(this.provider.session);
	}

	private dispatchSessionChange() {
		this.provider.onSessionChanged(this.provider.session);
	}

	private _pauseEvents() {
		this.provider.unhookBrowserEvents();
	}
	private _resumeEvents() {
		this.provider.hookBrowserEvents();
	}

	private async safeBrowserCall(f: () => void) {
		console.log('WindowAndTabMutator.safeBrowserCall start.');
		this._pauseEvents();
		await f();
		this._resumeEvents();
		console.log('WindowAndTabMutator.safeBrowserCall end.');
	}

}