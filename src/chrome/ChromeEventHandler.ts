import { PromisingChromeAPI } from './PromisingChromeAPI';
import { BrowserEventDispatcher, BrowserEventListener } from '../model/mutators/BrowserEventDispatcher';

// import console from '../utils/MutedConsole';

export class ChromeEventHandler implements BrowserEventDispatcher {

	private appTabId: number = 0;
	private enabled: boolean;
	private eventListeners: BrowserEventListener[];

	constructor() {

		console.log('ChromeEventHandler');
		
		this.enabled = true;
		this.eventListeners = [];

		this.dispatchEvent = this.dispatchEvent.bind(this);

		PromisingChromeAPI.windows.onRemoved.addListener(this.dispatchEvent);
		PromisingChromeAPI.windows.onFocusChanged.addListener(this.dispatchEvent);
		PromisingChromeAPI.tabs.onCreated.addListener(this.dispatchEvent);
		PromisingChromeAPI.tabs.onUpdated.addListener(this.dispatchEvent);
		PromisingChromeAPI.tabs.onMoved.addListener(this.dispatchEvent);
		PromisingChromeAPI.tabs.onAttached.addListener(this.dispatchEvent);
		PromisingChromeAPI.tabs.onRemoved.addListener(this.dispatchEvent);
		PromisingChromeAPI.tabs.onActivated.addListener(this.dispatchEvent);
		// PromisingChromeAPI.tabs.onHighlighted.addListener((_) => this.updateSessionSilently('onHighlighted'));
		// PromisingChromeAPI.tabs.onDetached.addListener((_) => this.updateSessionSilently('onDetached'));
		// PromisingChromeAPI.tabs.onReplaced.addListener((_) => this.updateSessionSilently('onReplaced'));

		PromisingChromeAPI.tabs.getCurrent()
			.then(
				(tab) => {
					if (tab) {
						this.appTabId = tab.id || 0;
					}
				}
			);

		// nonsense to avoid warning while some methods are unused	
		console.log(this.isPanelTab(0));
		//
	}

	public addListener(listener: BrowserEventListener): void {
		this.eventListeners.push(listener);
	}

	public removeListener(listener: BrowserEventListener): void {
		const index = this.eventListeners.indexOf(listener);
		if (index >= 0) {
			this.eventListeners.splice(index, 1);
		} else {
			throw (new Error('Cannot remove EventListener'));
		}
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	////

	private dispatchEvent(event: string, reason?: string) {
		if (this.enabled) {
			console.log(`${event} event dispatched`);
			this.eventListeners.forEach(listener => listener(event, reason || event));
		} else {
			console.log(`${event} event not dispatched`);
		}
	}

	private isPanelTab(id: number): boolean {
		return (id === this.appTabId);
	}

	// private onTabsUpdated(id: number, changeInfo: chrome.tabs.TabChangeInfo) {
	// 	if (this.isPanelTab(id) === false && changeInfo.status === 'complete') {
	// 		this.dispatchEvent('onTabsUpdated', `onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`);
	// 	}
	// }

	// private onTabsRemoved(id: number, removedInfo: chrome.tabs.TabRemoveInfo) {
	// 	if (this.isPanelTab(id) === false && removedInfo.isWindowClosing === false) {
	// 		this.dispatchEvent('onTabsRemoved', `onTabsRemoved - ${id} - ${JSON.stringify(removedInfo)}`);
	// 	}
	// }

}