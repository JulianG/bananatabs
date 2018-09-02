import { PromisingChromeAPI } from 'chrome-api/PromisingChromeAPI';
import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';

export async function initialiseFchrome(windowTabs: number[], focusIndex: number): Promise<FakePromisingChromeAPI> {
	const fchrome = new FakePromisingChromeAPI([]);
	windowTabs.forEach(async (tabs, i) => {
		const focused = (i === focusIndex);
		const win = await fchrome.windows.create({ focused });
		const windowId = win!.id;
		await fchrome.tabs.create({ windowId });
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


// export default class ChromeAPIEventCallbackInitialiser {

// 	private allCallbacks: { event: ChromeEvent, callback: Callback }[];

// 	constructor(chrome: ChromeAPI) {

// 		const allEvents: ChromeEvent[] = [
// 			chrome.windows.onCreated,
// 			chrome.windows.onFocusChanged,
// 			chrome.windows.onRemoved,
// 			chrome.tabs.onCreated,
// 			chrome.tabs.onActivated,
// 			chrome.tabs.onAttached,
// 			chrome.tabs.onMoved,
// 			chrome.tabs.onRemoved,
// 			chrome.tabs.onUpdated
// 		];

// 		this.allCallbacks = allEvents.map(event => {
// 			const callback = jest.fn();
// 			event.addListener(callback);
// 			return { event, callback };
// 		});
// 	}

// 	public confirmExpectations(expectations: Expectation[]) {
// 		this.allCallbacks.forEach(pair => {
// 			const expectation = expectations.find(ex => ex.event == pair.event);
// 			const times = (expectation) ? expectation.times : 0;
// 			expect(pair.callback).toHaveBeenCalledTimes(times);
// 		});

// 	}

// 	public getCallback(event: ChromeEvent): Callback {
// 		const pair = this.allCallbacks.find(pair => pair.event === event);
// 		return (pair) ? pair.callback : jest.fn();
// 	}




// }

// export function setExpectations(chrome: FakePromisingChromeAPI) {

// 	const eventLists = [
// 		chrome.windows.onCreated,
// 		chrome.windows.onFocusChanged,
// 		chrome.windows.onRemoved,
// 		chrome.tabs.onCreated,
// 		chrome.tabs.onActivated,
// 		chrome.tabs.onAttached,
// 		chrome.tabs.onMoved,
// 		chrome.tabs.onRemoved,
// 		chrome.tabs.onUpdated
// 	];

// 	const events = eventLists.map(event => {
// 		return { event, fn: jest.fn() };
// 	});

// 	events.forEach(event => {
// 		event.event.addListener(event.fn);
// 	});

// 	return events;
// }

// interface Expectation {
// 	event: any;
// 	times: number;
// }

// export function checkExpectations(events: any[], expectations: Expectation[]) {
// 	events.forEach(event => {
// 		const times = (expectations.find(ex => ex.event == event.event) || { times: 0 }).times;
// 		expect(event.fn).toHaveBeenCalledTimes(times);
// 	});
// }



