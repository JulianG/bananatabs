export interface TabMutator {
  selectTab(windowId: number, tabId: number): void;
  hideTab(windowId: number, tabId: number): void;
  showTab(windowId: number, tabId: number): void;
  deleteTab(windowId: number, tabId: number): void;
}