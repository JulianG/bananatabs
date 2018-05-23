import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';

export default class FakeBrowserController implements BrowserController {
	public closeWindow(id: number) {
		console.log(`FakeBrowserController.closeWindow(${id}) ...`);
		return Promise.resolve();
	}
	public closeTab(id: number) {
		console.log(`FakeBrowserController.closeTab(${id}) ...`);
		return Promise.resolve();
	}
	public selectTab(id: number) {
		console.log(`FakeBrowserController.selectTab(${id}) ...`);
		return Promise.resolve();
	}
	public createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`FakeBrowserController.createTab(...) ...`);
		return Promise.resolve();
	}

	public showWindow(window: BT.Window, first: boolean) {
		console.log(`FakeBrowserController.showWindow(...) ...`);
		return Promise.resolve();
	}
}