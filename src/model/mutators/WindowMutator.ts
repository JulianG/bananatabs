import * as BT from '../CoreTypes';

interface WindowMutator {
	renameItem(item: BT.ListItem, title: string): void;
	collapseWindow(window: BT.Window): void;
	expandWindow(window: BT.Window): void;
	toggleVisibility(window: BT.Window): void;
	hideWindow(window: BT.Window): void;
	showWindow(window: BT.Window): void;
	deleteWindow(window: BT.Window): void;
}

export default WindowMutator;

import SessionProvider from '../SessionProvider';
import TabMutator from './TabMutator';

export class DefaultWindowMutator implements WindowMutator {

	constructor(private provider: SessionProvider, private tabMutator: TabMutator) {
	}

	renameItem(item: BT.ListItem, title: string) {
		item.title = title;
		this.updateSession();
	}

	collapseWindow(window: BT.Window) {
		window.expanded = false;
		this.updateSession();
	}

	expandWindow(window: BT.Window) {
		window.expanded = true;
		this.updateSession();
	}

	toggleVisibility(window: BT.Window) {
		if (window.visible) {
			this.hideWindow(window);
		} else {
			this.showWindow(window);
		}
	}

	hideWindow(window: BT.Window) {
		chrome.windows.remove(window.id, () => {
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
						console.log('showTab: ' + tab.title);
						this.tabMutator.showTab(window, tab);
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
		chrome.windows.remove(window.id, () => {
			this.provider.session.windows.splice(index, 1);
			this.updateSession();
		});
	}

	////

	private updateSession() {
		this.provider.storeSession(this.provider.session);
		this.provider.onSessionChanged(this.provider.session);
	}

	private removeLastTabInWindow(newWindow: chrome.windows.Window) {
		const lastTabInNewWindow = newWindow.tabs![newWindow.tabs!.length - 1];
		if (lastTabInNewWindow) {
			console.log('removingTab: ' + lastTabInNewWindow.id);
			chrome.tabs.remove(lastTabInNewWindow.id!);
		}
	}

}