import * as BT from '../CoreTypes';

export default interface BrowserController {
	closeWindow(id: number): void;
	closeTab(id: number): void;
	selectTab(windowId: number, tabId: number): void;
	createTab(window: BT.Window, tab: BT.Tab): void;
	showWindow(window: BT.Window, first: boolean): void;
}