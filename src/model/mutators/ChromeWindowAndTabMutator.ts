import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';
import WindowMutator from './WindowMutator';

export default class ChromeWindowAndTabMutator implements TabMutator, WindowMutator {

	constructor(private provider: SessionProvider) {
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

		if (chrome && chrome.windows) {
			chrome.windows.update(window.id, { focused: true });
			chrome.tabs.update(tab.id, { active: true });
		}
	}

	toggleTabVisibility(window: BT.Window, tab: BT.Tab) {
		if (tab.visible) {
			this.hideTab(window, tab);
		} else {
			this.showTab(window, tab);
		}
	}

	hideTab(window: BT.Window, tab: BT.Tab) {
		tab.visible = false;
		if (window.visible) {
			chrome.tabs.remove(tab.id, () => {
				tab.id = -1;
				this.safeRenameWindow(window);
				this.updateSession();
			});
		} else {
			this.updateSession();
		}
	}

	showTab(window: BT.Window, tab: BT.Tab) {

		tab.visible = true;
		if (window.visible) {
			const props: chrome.tabs.CreateProperties = {
				windowId: window.visible ? window.id : 0,
				index: tab.index,
				url: tab.url,
				active: tab.active
			};
			chrome.tabs.create(props, newTab => {
				tab.id = newTab.id || -1;
				this.updateSession();
			});
		} else {
			this.showWindow(window);
		}
	}

	deleteTab(window: BT.Window, tab: BT.Tab) {
		const tabIndex = window.tabs.indexOf(tab);
		console.assert(tabIndex >= 0);
		window.tabs.splice(tabIndex, 1);
		if (window.visible) {
			chrome.tabs.remove(tab.id, () => {
				this.safeRenameWindow(window);
				this.updateSession();
			});
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

	hideWindow(window: BT.Window) {
		chrome.windows.remove(window.id, () => {
			this.safeRenameWindow(window);
			window.visible = false;
			this.updateSession();
		});
	}

	showWindow(window: BT.Window) {

		const createData: chrome.windows.CreateData = {
			left: window.geometry.left,
			top: window.geometry.top,
			width: window.geometry.width,
			height: window.geometry.height,
			focused: window.focused,
			type: window.type
		};

		chrome.windows.create(createData, newWindow => {

			if (newWindow) {

				window.visible = true;
				window.id = newWindow.id;
				window.tabs.forEach((tab, i) => {
					if (tab.visible) {
						this.showTab(window, tab);
						if (i === window.tabs.length - 1) {
							this.removeLastTabInWindow(newWindow);
						}
					}
				});
				this.updateSession();
			}
		});
	}

	deleteWindow(window: BT.Window) {

		const index = this.provider.session.windows.indexOf(window);
		console.assert(index >= 0);
		try {
			chrome.windows.remove(window.id, () => {
				this.provider.session.windows.splice(index, 1);
				this.updateSession();
			});
		} catch (e) {
			console.warn(`Could not delete window for real... ${window.id}`);
		}
	}

	///

	private removeLastTabInWindow(newWindow: chrome.windows.Window) {
		const lastTabInNewWindow = newWindow.tabs![newWindow.tabs!.length - 1];
		if (lastTabInNewWindow) {
			chrome.tabs.remove(lastTabInNewWindow.id!);
		}
	}

	private safeRenameWindow(window: BT.Window) {
		window.title = window.title || 'My Window';
	}

	private updateSession() {
		this.provider.storeSession(this.provider.session);
		this.provider.onSessionChanged(this.provider.session);
	}
}