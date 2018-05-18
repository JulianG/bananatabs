import * as BT from '../model/CoreTypes';
import BrowserController from '../model/mutators/BrowserController';

function getResolvingPromise() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 125);
	});
}

export default class FakeBrowserController implements BrowserController {
	public closeWindow(id: number) {
		console.log(`FakeBrowserController.closeWindow(${id}) ...`);
		return getResolvingPromise();
	}
	public closeTab(id: number) {
		console.log(`FakeBrowserController.closeTab(${id}) ...`);
		return getResolvingPromise();
	}
	public selectTab(id: number) {
		console.log(`FakeBrowserController.selectTab(${id}) ...`);
		return getResolvingPromise();
	}
	public createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`FakeBrowserController.createTab(...) ...`);
		return getResolvingPromise();
	}

	public showWindow(window: BT.Window, first: boolean) {
		console.log(`FakeBrowserController.showWindow(...) ...`);
		return getResolvingPromise();
	}
}