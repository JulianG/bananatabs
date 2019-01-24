import * as BT from '../CoreTypes';

export interface SystemDisplayInfo {
  id: string;
  bounds: BT.Rectangle;
}

export interface EventListener {
  (event: string, reason?: string): void;
}

export default interface BrowserController {
  closeWindow(id: number): Promise<void>;
  closeTab(id: number): Promise<void>;
  selectTab(windowId: number, tabId: number): Promise<void>;
  showTab(window: BT.Window, tab: BT.Tab): Promise<void>;
  showWindow(window: BT.Window): Promise<void>;
  getAllWindows(): Promise<BT.Window[]>;

  addEventListener(listener: EventListener): void;
  removeEventListener(listener: EventListener): void;

  getDisplayInfo(): Promise<SystemDisplayInfo[]>;

  getAppURL(): string;
}
