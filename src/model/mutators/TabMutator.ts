import * as BT from '../CoreTypes';

interface TabMutator {
	renameItem(item: BT.ListItem, title: string): void;
	selectTab(window: BT.Window, tab: BT.Tab): void;
	toggleVisibility(window: BT.Window, tab: BT.Tab): void;
	hideTab(tab: BT.Tab): void;
	showTab(window: BT.Window, tab: BT.Tab): void;
	deleteTab(window: BT.Window, tab: BT.Tab): void;
}

export default TabMutator;

import SessionProvider from '../SessionProvider';

export class DefaultTabMutator implements TabMutator {

	constructor(private provider: SessionProvider) {
	}
	
	renameItem(item: BT.ListItem, title: string) {
		item.title = title;
		this.updateSession();
	}

	selectTab(window: BT.Window, tab: BT.Tab) {

		window.tabs.forEach(t => {
			t.active = false;
		});
		tab.active = true;
		this.updateSession();

		chrome.windows.update(window.id, { focused: true });
		chrome.tabs.update(tab.id, { active: true });
	}

	toggleVisibility(window: BT.Window, tab: BT.Tab) {
		if (tab.visible) {
			this.hideTab(tab);
		} else {
			this.showTab(window, tab);
		}
	}

	hideTab(tab: BT.Tab) {

		chrome.tabs.remove(tab.id, () => {
			tab.visible = false;
			this.updateSession();
		});

	}

	showTab(window: BT.Window, tab: BT.Tab) {

		tab.visible = true;

		const props: chrome.tabs.CreateProperties = {
			windowId: window.id,
			index: tab.index,
			url: tab.url,
			active: tab.active
		};
		chrome.tabs.create(props, newTab => {
			tab.id = newTab.id || -1;
			this.updateSession();
		});
	}

	deleteTab(window: BT.Window, tab: BT.Tab) {

		const tabIndex = window.tabs.indexOf(tab);
		console.assert(tabIndex >= 0);

		chrome.tabs.remove(tab.id, () => {
			tab.visible = false;
			window.tabs.splice(tabIndex, 1);
			this.updateSession();
		});

	}

	///

	private updateSession() {
		this.provider.storeSession(this.provider.session);
		this.provider.onSessionChanged(this.provider.session);
	}

}