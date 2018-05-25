import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';
import WindowMutator from './WindowMutator';
import BrowserController from './BrowserController';

import MutedConsole from '../../utils/MutedConsole';
const console = new MutedConsole();

export default class WindowAndTabMutator implements TabMutator, WindowMutator {

	constructor(private provider: SessionProvider, private browser: BrowserController) {
	}

	// TabMutator and WindowMutator

	renameItem(item: BT.ListItem, title: string) {
		item.title = title;
		this.storeSession();
	}

	// TabMutator

	selectTab(window: BT.Window, tab: BT.Tab) {

		window.tabs.forEach(t => {
			t.active = false;
		});
		tab.active = true;
		this.storeSession();
		this.browser.selectTab(window.id, tab.id);
	}

	toggleTabVisibility(window: BT.Window, tab: BT.Tab) {
		if (tab.visible) {
			this.hideTab(window, tab);
		} else {
			this.showTab(window, tab);
		}
	}

	async hideTab(window: BT.Window, tab: BT.Tab) {
		console.log(`WindowAndTabMutator.hideTab:`);
		tab.visible = false;
		this.storeSession();
		if (window.visible) {
			this.safeRenameWindow(window);
			await this.browser.closeTab(tab.id);
			tab.id = -1; // why?
		}
	}

	async showTab(window: BT.Window, tab: BT.Tab) {
		tab.visible = true;
		this.storeSession();
		this.dispatchSessionChange();
		if (window.visible) {
			await this.browser.createTab(window, tab);
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
			await this.browser.closeTab(tab.id);
		}
		this.storeSession();
	}

	/// WindowMutator

	collapseWindow(window: BT.Window) {
		window.expanded = false;
		this.storeSession();
		this.dispatchSessionChange();
	}

	expandWindow(window: BT.Window) {
		window.expanded = true;
		this.storeSession();
		this.dispatchSessionChange();
	}

	async toggleWindowVisibility(window: BT.Window) {
		if (window.visible) {
			await this._hideWindow(window);
		} else {
			await this._showWindow(window);
		}
		this.dispatchSessionChange();
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
		const index = this.provider.session.windows.indexOf(window);
		console.assert(index >= 0);
		this.provider.session.windows.splice(index, 1);
		this.storeSession();
		if (window.visible) {
			await this.browser.closeWindow(window.id);
		}
		this.dispatchSessionChange();
	}

	///

	private async _hideWindow(window: BT.Window) {
		this.safeRenameWindow(window);
		window.visible = false;
		this.storeSession();
		await this.browser.closeWindow(window.id);
	}

	private async _showWindow(window: BT.Window) {
		window.geometry = this.clampGeometry(window.geometry);
		window.visible = true;
		this.storeSession();
		await this.browser.showWindow(window);
	}

	///

	private safeRenameWindow(window: BT.Window) {
		window.title = window.title || 'My Window';
	}

	private storeSession() {
		this.provider.storeSession(this.provider.session);
	}

	private dispatchSessionChange() {
		this.provider.onSessionChanged(this.provider.session);
	}

	private clampGeometry(g: BT.Geometry): BT.Geometry {
		const screenW = window.screen.availHeight;
		const screenH = window.screen.availHeight;

		return {
			width: g.width,
			height: g.height,
			left: (g.left > screenW) ? 0 : g.left,
			top: (g.top > screenH) ? 0 : g.top
		};
	}
}