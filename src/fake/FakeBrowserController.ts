import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';

export default class FakeBrowserController implements BrowserController {

	constructor() {
		console.warn('FakeBrowserController');
	}
	public closeWindow(id: number) {
		console.log(`FakeBrowserController.closeWindow(${id}) ...`);
		return Promise.resolve();
	}
	public closeTab(id: number) {
		console.log(`FakeBrowserController.closeTab(${id}) ...`);
		return Promise.resolve();
	}
	public selectTab(windowId: number, tabId: number) {
		console.log(`FakeBrowserController.selectTab(${tabId}) ...`);
		return Promise.resolve();
	}
	public createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`FakeBrowserController.createTab(...) ...`);
		return Promise.resolve();
	}

	public showWindow(window: BT.Window) {
		console.log(`FakeBrowserController.showWindow(...) ...`);
		return Promise.resolve();
	}
	public async getAllWindows(): Promise<BT.Window[]> {
		return [];
	}

	public addEventListener(listener: (event: string, reason?: string) => void) {
		//
	}

	public removeEventListener(listener: (event: string, reason?: string) => void) {
		//
	}

	public toggleEvents(t: boolean) {
		//
	}

	public areEventsEnabled(): boolean {
		return true;
	}

}