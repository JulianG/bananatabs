import { PromisingChromeAPI } from 'chrome-api/PromisingChromeAPI';
import { BrowserEventDispatcher } from '../model/browsercontroller/BrowserEventDispatcher';

interface EventListener {
  (event: string, reason?: string): void;
}

export class ChromeEventDispatcher implements BrowserEventDispatcher {
  private appTabId: number = 0;
  private eventListeners: EventListener[];

  constructor(chromeAPI: PromisingChromeAPI) {
    this.eventListeners = [];

    chromeAPI.windows.onRemoved.addListener(id => {
      this.dispatchEvent('onRemoved', `onWindowRemoved ${id}`);
    });
    chromeAPI.windows.onFocusChanged.addListener(_ =>
      this.dispatchEvent('onFocusChanged')
    );
    chromeAPI.tabs.onCreated.addListener(tab => {
      this.dispatchEvent('onTabsCreated', `onTabsCreated ${tab.id}`);
    });
    chromeAPI.tabs.onUpdated.addListener(this.onTabsUpdated.bind(this));
    chromeAPI.tabs.onMoved.addListener(_ => this.dispatchEvent('onTabsMoved'));
    chromeAPI.tabs.onAttached.addListener((id, info) =>
      this.dispatchEvent('onTabsAttached')
    );
    chromeAPI.tabs.onRemoved.addListener(this.onTabsRemoved.bind(this));
    chromeAPI.tabs.onActivated.addListener(tab =>
      this.dispatchEvent('onActivated', `onActivated tabId:${tab.tabId}`)
    );
    // chromeAPI.tabs.onHighlighted.addListener((_) => this.updateSessionSilently('onHighlighted'));
    // chromeAPI.tabs.onDetached.addListener((_) => this.updateSessionSilently('onDetached'));
    // chromeAPI.tabs.onReplaced.addListener((_) => this.updateSessionSilently('onReplaced'));

    chromeAPI.tabs.getCurrent().then(tab => {
      if (tab) {
        this.appTabId = tab.id || 0;
      }
    });
  }

  public addListener(listener: EventListener): void {
    this.eventListeners.push(listener);
  }

  public removeListener(listener: EventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index >= 0) {
      this.eventListeners.splice(index, 1);
    } else {
      throw new Error('Cannot remove EventListener');
    }
  }

  ////

  private dispatchEvent(event: string, reason?: string) {
    this.eventListeners.forEach(listener => listener(event, reason || event));
  }

  private isPanelTab(id: number): boolean {
    return id === this.appTabId;
  }

  private onTabsUpdated(id: number, changeInfo: chrome.tabs.TabChangeInfo) {
    if (this.isPanelTab(id) === false && changeInfo.status === 'complete') {
      this.dispatchEvent(
        'onTabsUpdated',
        `onTabsUpdated ${id}:${JSON.stringify(changeInfo)}`
      );
    }
  }

  private onTabsRemoved(id: number, removedInfo: chrome.tabs.TabRemoveInfo) {
    if (
      this.isPanelTab(id) === false &&
      removedInfo.isWindowClosing === false
    ) {
      this.dispatchEvent(
        'onTabsRemoved',
        `onTabsRemoved - ${id} - ${JSON.stringify(removedInfo)}`
      );
    }
  }
}
