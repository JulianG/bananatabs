import * as BT from '../model/CoreTypes';
import BrowserController, { SystemDisplayInfo, EventListener } from '../model/mutators/BrowserController';

import console from '../utils/MutedConsole';

export const fakeDisplayInfo: BT.DisplayInfo = {
	id: 'fakedisplay',
	name: 'fakedisplay',
	bounds: {
		top: 0,
		left: 0,
		width: 100,
		height: 150
	}
};

export default class FakeBrowserController implements BrowserController {

	private lastId: number = 1000;
	private eventListeners: EventListener[];
	private windows: BT.Window[];

	constructor(private displays: BT.DisplayInfo[], initialWindows: BT.Window[]) {
		console.warn('FakeBrowserController ' + this.displays);
		this.windows = [...initialWindows];
		this.eventListeners = [];

		this.closeTab = this.closeTab.bind(this);
		this.closeWindow = this.closeWindow.bind(this);
	}
	public async closeWindow(id: number) {
		console.log(`FakeBrowserController.closeWindow(${id}) ...`);
		const index = this.windows.findIndex(w => w.id === id);
		if (index >= 0) {

			const tabs = this.windows[index].tabs;
			const tabPromises = tabs.map(t => t.id).map(this.closeTab);
			await Promise.all(tabPromises);

			this.windows.splice(index, 1);
			await this.delay();
			this.dispatchEvent('onWindowClosed', id.toString());
		}

	}
	public async closeTab(id: number) {
		console.log('trying to closing tab', id);
		const window = this.windows.find(w => w.tabs.some(t => t.id === id));
		if (window) {

			console.log('closing tab', id);
			const tabIndex = window.tabs.findIndex(t => t.id === id);
			window.tabs.splice(tabIndex, 1);
			await this.delay();
			this.dispatchEvent('onTabClosed', id.toString());

			// if (window.tabs.length > 0) {
			// 	console.log('selecting other tab');
			// 	const lastTab = window.tabs[window.tabs.length - 1];
			// 	await this.selectTab(window.id, lastTab.id);
			// } else {
			// 	console.log('NOT selecting other tab');
			// }

			console.log('finished closing tab ', id);
		} else {
			console.warn('NOT closing tab', id);
		}
	}
	public async selectTab(windowId: number, tabId: number) {
		console.log(`FakeBrowserController.selectTab(${tabId}) ...`);
		const window = this.windows.find(w => w.id === windowId);
		if (window) {
			window.tabs.forEach(t => t.selected = t.active = t.id === tabId);
		}
		await this.delay();
		this.dispatchEvent('onTabSelected', tabId.toString());
	}
	public async createTab(window: BT.Window, tab: BT.Tab) {
		console.log(`FakeBrowserController.createTab(...) ...`);
		const existingWindow = this.windows.find(w => w.id === window.id);
		if (existingWindow) {
			const existingTab = existingWindow.tabs.find(t => t.id === tab.id);
			if (!existingTab) {
				existingWindow.tabs.push(tab);
				existingWindow.tabs = existingWindow.tabs.sort((a, b) => a.index - b.index);
				await this.delay();
				this.dispatchEvent('onTabCreated');
				this.selectTab(existingWindow.id, tab.id);
			}
		}
	}

	public async showWindow(w: BT.Window) {
		const window = BT.cloneWindow(w);
		console.log(`FakeBrowserController.showWindow(...) ...`);
		window.id = this.getNextId();
		w.id = window.id;
		const tabs = window.tabs.filter(t => t.visible);
		window.tabs = [];
		this.windows.push(window);
		await this.delay();

		this.dispatchEvent('onWindowCreated');

		tabs.forEach(tab => {
			this.createTab(window, tab);
		});
	}
	public async getAllWindows(): Promise<BT.Window[]> {
		await this.delay();
		return this.windows;
	}

	public addEventListener(listener: EventListener) {
		const existing = this.eventListeners.find(l => l === listener);
		if (!existing) {
			this.eventListeners.push(listener);
		}
	}

	public removeEventListener(listener: EventListener) {
		const index = this.eventListeners.findIndex(l => l === listener);
		if (index >= 0) {
			this.eventListeners.splice(index, 1);
		}
	}

	public async getDisplayInfo(): Promise<SystemDisplayInfo[]> {
		return [];
	}

	public getAppURL(): string {
		return window.location.toString();
	}

	private getNextId(): number {
		return ++this.lastId;
	}

	private delay(): Promise<void> {
		return new Promise((resolve, reject) => {
			setTimeout(() => { resolve(); }, 1 + Math.random() / 10);
		});
	}

	private dispatchEvent(event: string, reason?: string) {
		this.eventListeners.forEach(listener => {
			listener(event, reason);
		});
		console.log(`dispatching event: ${event} - ${reason}`);
		// console.table(this.windows);
	}

}