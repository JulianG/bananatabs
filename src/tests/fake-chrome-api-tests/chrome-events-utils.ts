import { PromisingChromeAPI } from 'chrome-api/PromisingChromeAPI';
import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';

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

interface ChromeEvent {
	addListener: Function;
	removeListener: Function;
}

type Callback = jest.Mock<{}>;

interface Expectation {
	event: ChromeEvent;
	times: number;
}

export type AllCallbacks = ChromeEventWithCallback[];

interface ChromeEventWithCallback {
	id: string;
	event: ChromeEvent;
	callback: Callback;
}

//  mockFn.mockReset() ?

export function getAllCallbacks(fchrome: PromisingChromeAPI) {

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

expect.extend({ toHaveBeenCalledLike: confirmExpectations });

function confirmExpectations(allCallbacks: AllCallbacks, expectations: Expectation[]) {

	for (let i = 0; i < allCallbacks.length; i++) {

		const pair = allCallbacks[i];

		const expectation = expectations.find(ex => ex.event === pair.event);
		const times = (expectation) ? expectation.times : 0;

		if (pair.callback.mock.calls.length !== times) {
			return {
				message: () => {
					return `expected event '${(pair.id)}' \nto have been triggered: `
						+ `  ${(times)} times, but`
						+ `\ninstead it was triggered:`
						+ ` ${pair.callback.mock.calls.length} times.`;
				},
				pass: false
			};
		}
	}

	return {
		message: () => `all the expectations where correct`,
		pass: true
	};

}