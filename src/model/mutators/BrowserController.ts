import * as BT from '../CoreTypes';

export default interface BrowserController {
	closeWindow(id: number): Promise<void>;
	closeTab(id: number): Promise<void>;
	selectTab(windowId: number, tabId: number): Promise<void>;
	createTab(window: BT.Window, tab: BT.Tab): Promise<void>;
	showWindow(window: BT.Window): Promise<void>;
	getAllWindows(): Promise<BT.Window[]>;

	addEventListener(listener: (event: string, reason?: string) => void): void;
	removeEventListener(listener: (event: string, reason?: string) => void): void;
	toggleEvents(t: boolean): void;
	areEventsEnabled(): boolean;
}