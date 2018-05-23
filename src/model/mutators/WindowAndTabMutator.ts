import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';
import WindowMutator from './WindowMutator';
import BrowserController from './BrowserController';

// import MutedConsole from '../../utils/MutedConsole';
// const console = new MutedConsole();

export default class WindowAndTabMutator implements TabMutator, WindowMutator {

	constructor(private provider: SessionProvider, private browser: BrowserController) {
	}

	// TabMutator and WindowMutator

	renameItem(item: BT.ListItem, title: string) {
		item.title = title;
		this.updateSession();
	}

	// TabMutator

	selectTab(window: BT.Window, tab: BT.Tab) {

		window.tabs.forEach(t => {
			t.active = false;
		});
		tab.active = true;
		this.updateSession();

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
		tab.visible = false;
		if (window.visible) {
			await this.browser.closeTab(tab.id);
			tab.id = -1; // why?
			this.safeRenameWindow(window);
		} 
		this.updateSession();
	}

	async showTab(window: BT.Window, tab: BT.Tab) {
		tab.visible = true;
		if (window.visible) {
			await this.browser.createTab(window, tab);
			this.updateSession();
		} else {
			this.showWindow(window);
		}
	}

	async deleteTab(window: BT.Window, tab: BT.Tab) {
		const tabIndex = window.tabs.indexOf(tab);
		console.assert(tabIndex >= 0);
		window.tabs.splice(tabIndex, 1);

		if (window.visible && tab.visible) {
			this.safeRenameWindow(window);
			await this.browser.closeTab(tab.id);
			this.updateSession();
		} else {
			this.updateSession();
		}
	}

	/// WindowMutator

	collapseWindow(window: BT.Window) {
		window.expanded = false;
		this.updateSession();
	}

	expandWindow(window: BT.Window) {
		window.expanded = true;
		this.updateSession();
	}

	toggleWindowVisibility(window: BT.Window) {
		if (window.visible) {
			this.hideWindow(window);
		} else {
			this.showWindow(window);
		}
	}

	async hideWindow(window: BT.Window) {
		this.safeRenameWindow(window);
		window.visible = false;
		await this.browser.closeWindow(window.id);
		this.updateSession();
	}

	async showWindow(window: BT.Window) {
		window.geometry = this.clampGeomtry(window.geometry);
		const visibleWindows = this.provider.session.windows.filter(w => w.visible).length;
		await this.browser.showWindow(window, visibleWindows === 0);
		window.visible = true;
		this.updateSession();
	}

	async deleteWindow(window: BT.Window) {
		const index = this.provider.session.windows.indexOf(window);
		console.assert(index >= 0);
		try {
			await this.browser.closeWindow(window.id);
			this.provider.session.windows.splice(index, 1);
			this.updateSession();
		} catch (e) {
			console.warn(`Could not delete window for real... ${window.id}`);
		}
	}

	///

	private safeRenameWindow(window: BT.Window) {
		window.title = window.title || 'My Window';
	}

	private updateSession() {
		this.provider.storeSession(this.provider.session);
		this.provider.onSessionChanged(this.provider.session);
	}

	private clampGeomtry(g: BT.Geometry): BT.Geometry {
		const cg = { ...g };
		const gRight = g.left + g.width;
		const gBottom = g.top + g.height;

		const availWidth = window.screen.availHeight;
		const availHeight = window.screen.availHeight;

		cg.left = gRight > availWidth ? Math.max(0, g.left + gRight - availWidth) : g.left;
		cg.top = gBottom > availHeight ? Math.max(0, g.top + gBottom - availHeight) : g.top;

		const cgRight = cg.left + cg.width;
		const cgBottom = cg.top + cg.height;

		cg.width = cgRight > availWidth ? availWidth : cg.width;
		cg.height = cgBottom > availHeight ? availHeight : cg.height;

		return cg;
	}

}