import * as BT from '../../model/CoreTypes';
import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';
import { AllCallbacks } from './chrome-events-utils';

export async function initialiseFchromeFromSession(session: BT.Session) {

	const fchrome = new FakePromisingChromeAPI();
	const visibleWindows = session.windows.filter(w => w.visible);
	const newWindowPromises = visibleWindows.map(async (w: BT.Window, i) => {
		return new Promise(async (wResolve) => {
			const win = await fchrome.windows.create({ focused: w.focused });
			win!.tabs!.splice(0, 1); // removing first tab because it's chrome://newtab/
			const windowId = win!.id;
			const visibleTabs = w.tabs.filter(t => t.visible);
			const newTabPromises = visibleTabs.map(vt => {
				return new Promise(async (tResolve) => {
					const newTab = await fchrome.tabs.create({
						windowId,
						active: vt.active,
						url: vt.url
					});
					newTab.highlighted = vt.highlighted;
					vt.title = vt.title;
					tResolve(newTab);
				});
			});
			await Promise.all(newTabPromises);
			wResolve(win);
		});
	});
	await Promise.all(newWindowPromises);
	return fchrome;
}

export async function initialiseFchrome(windowTabs: number[], focusIndex: number): Promise<FakePromisingChromeAPI> {
	const fchrome = new FakePromisingChromeAPI();
	windowTabs.forEach(async (numberOfTabs, index) => {
		const focused = (index === focusIndex);
		const win = await fchrome.windows.create({ focused });
		const windowId = win!.id;
		for (let u = 0; u < numberOfTabs - 1; ++u) {
			await fchrome.tabs.create({ windowId });
		}
	});
	return fchrome;
}

export function getAllCallbacks(fchrome: FakePromisingChromeAPI) {

	const allCallbacks: AllCallbacks = [
		{ id: 'chrome.windows.onCreated', event: fchrome.windows.onCreated, callback: jest.fn() },
		{ id: 'chrome.windows.onFocusChanged', event: fchrome.windows.onFocusChanged, callback: jest.fn() },
		{ id: 'chrome.windows.onRemoved', event: fchrome.windows.onRemoved, callback: jest.fn() },
		{ id: 'chrome.tabs.onCreated', event: fchrome.tabs.onCreated, callback: jest.fn() },
		{ id: 'chrome.tabs.onActivated', event: fchrome.tabs.onActivated, callback: jest.fn() },
		{ id: 'chrome.tabs.onAttached', event: fchrome.tabs.onAttached, callback: jest.fn() },
		{ id: 'chrome.tabs.onMoved', event: fchrome.tabs.onMoved, callback: jest.fn() },
		{ id: 'chrome.tabs.onRemoved', event: fchrome.tabs.onRemoved, callback: jest.fn() },
		{ id: 'chrome.tabs.onUpdated', event: fchrome.tabs.onUpdated, callback: jest.fn() },
		{ id: 'chrome.tabs.onHighlighted', event: fchrome.tabs.onHighlighted, callback: jest.fn() }
	];

	hookAllCallbacks(allCallbacks);

	return allCallbacks;
}

function hookAllCallbacks(allCallbacks: AllCallbacks) {
	allCallbacks.forEach(entry => {
		entry.callback.mockReset();
		entry.event.addListener(entry.callback);
	});
}

export function resetAllCallbacks(allCallbacks: AllCallbacks) {
	allCallbacks.forEach(entry => {
		entry.callback.mockReset();
	});
}
