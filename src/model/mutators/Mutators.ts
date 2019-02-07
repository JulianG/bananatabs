import * as BT from '../core/CoreTypes';

export interface SessionMutator {
  sortWindows(f: (a: BT.Window, b: BT.Window) => number): void;
  setWindows(windows: BT.Window[]): void;
  addWindows(windows: BT.Window[]): void;
}

export interface WindowMutator {
  renameWindow(id: number, title: string): void;
  collapseWindow(id: number): void;
  expandWindow(id: number): void;
  hideWindow(id: number): void;
  showWindow(id: number): void;
  deleteWindow(id: number): void;
}

export interface TabMutator {
  selectTab(windowId: number, tabId: number): void;
  hideTab(windowId: number, tabId: number): void;
  showTab(windowId: number, tabId: number): void;
  deleteTab(windowId: number, tabId: number): void;
}