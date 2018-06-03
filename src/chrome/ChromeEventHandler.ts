import SessionProvider from '../model/SessionProvider';


export default class ChromeEventHandler {

	private enabled: boolean;

	constructor(private provider: SessionProvider) {

		if (chrome && chrome.tabs) {
			chrome.windows.onRemoved.addListener((id) => this.updateSession(`onWindowRemoved ${id}`));
			chrome.windows.onFocusChanged.addListener((_) => this.updateSession('onFocusChanged'));
			chrome.tabs.onCreated.addListener((tab) => this.updateSession(`onTabsCreated ${tab.id}`));
			chrome.tabs.onUpdated.addListener(this.onTabsUpdated.bind(this));
			chrome.tabs.onMoved.addListener((_) => this.updateSession('onTabsMoved'));
			chrome.tabs.onAttached.addListener((id, info) => this.updateSession('onTabsAttached'));
			chrome.tabs.onRemoved.addListener(this.onTabsRemoved.bind(this));
			chrome.tabs.onActivated.addListener((_) => this.updateSession('onActivated'));
			// chrome.tabs.onHighlighted.addListener((_) => this.updateSessionSilently('onHighlighted'));
			// chrome.tabs.onDetached.addListener((_) => this.updateSessionSilently('onDetached'));
			// chrome.tabs.onReplaced.addListener((_) => this.updateSessionSilently('onReplaced'));
		}

	}

	public isEnabled() {
		return this.enabled;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	////

	private updateSession(reason?: string) {
		if (this.enabled) {
			this.provider.updateSession(reason);
		}
	}

	private isPanelTab(id: number): boolean {
		return (id === this.provider.session.panelWindow.tabs[0].id);
	}

	private onTabsUpdated(id: number, changeInfo: chrome.tabs.TabChangeInfo) {
		if (this.enabled && this.isPanelTab(id) === false && changeInfo.status === 'complete') {
			this.provider.updateSession(`onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`);
		}
	}

	private onTabsRemoved(id: number, removedInfo: chrome.tabs.TabRemoveInfo) {
		if (this.enabled && this.isPanelTab(id) === false && removedInfo.isWindowClosing === false) {
			this.provider.updateSession(`onTabsRemoved - ${id} - ${JSON.stringify(removedInfo)}`);
		}
	}

}