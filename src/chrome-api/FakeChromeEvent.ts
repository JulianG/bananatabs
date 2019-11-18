/*
tslint:disable no-any
*/

interface T extends Function {}

export class FakeChromeEvent<S extends T> implements chrome.events.Event<T> {
  private list: T[];

  constructor() {
    this.list = [];
  }

  fakeDispatch(...args: any[]) {
    const list = this.list;
    list.forEach((cb) => {
      cb(...args);
    });
  }

  getRules() {
    return [];
  }

  addListener(callback: T) {
    this.list.push(callback);
  }

  hasListener(callback: T) {
    return this.list.findIndex((c) => c === callback) > -1;
  }

  removeListener(callback: T) {
    const index = this.list.findIndex((c) => c === callback);
    if (index > -1) {
      this.list.splice(index, 1);
    }
  }

  removeRules() {
    /* */
  }

  addRules(_: any[]) {
    /* */
  }

  hasListeners() {
    return this.list.length > 0;
  }
}

export class WindowReferenceEvent extends FakeChromeEvent<
  (
    window: chrome.windows.Window,
    filters?: chrome.windows.WindowEventFilter
  ) => void
> {}
export class WindowIdEvent extends FakeChromeEvent<
  ((
    windowId: number,
    filters?: chrome.windows.WindowEventFilter | undefined
  ) => undefined)
> {}
export class TabHighlightedEvent extends FakeChromeEvent<
  (highlightInfo: chrome.tabs.HighlightInfo) => void
> {}
export class TabRemovedEvent extends FakeChromeEvent<
  (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => void
> {}
export class TabUpdatedEvent extends FakeChromeEvent<
  (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => void
> {}
export class TabAttachedEvent extends FakeChromeEvent<
  (tabId: number, attachInfo: chrome.tabs.TabAttachInfo) => void
> {}
export class TabMovedEvent extends FakeChromeEvent<
  (tabId: number, moveInfo: chrome.tabs.TabMoveInfo) => void
> {}
/*
class TabDetachedEvent 
  extends FakeChromeEvent<(tabId: number, detachInfo: chrome.tabs.TabDetachInfo) => void> { }
*/
export class TabCreatedEvent extends FakeChromeEvent<
  (tab: chrome.tabs.Tab) => void
> {}
export class TabActivatedEvent extends FakeChromeEvent<
  (activeInfo: chrome.tabs.TabActiveInfo) => void
> {}
/*
export class TabReplacedEvent 
	extends FakeChromeEvent<(addedTabId: number, removedTabId: number) => void> { }
export class TabSelectedEvent 
	extends FakeChromeEvent<(tabId: number, selectInfo: chrome.tabs.TabWindowInfo) => void> { }
export class TabZoomChangeEvent 
	extends FakeChromeEvent<(ZoomChangeInfo: chrome.tabs.ZoomChangeInfo) => void> { }
*/
