import { PromisingChromeAPI } from 'chrome-api/PromisingChromeAPI';

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

// this extension is here because `toHaveBeenNthCalledWith` seems to have disappeared
expect.extend({
	toHaveBeenCalledNthTimeWith: (fn: jest.Mock<{}>, nthCall: number, expected: {}) => {

		if (fn.mock.calls.length < nthCall) {
			return {
				message: () => {
					return `expected function to have been called at least ${nthCall} times,
but it was instead called ${fn.mock.calls.length} times`;
				},
				pass: false
			};
		}

		const args = fn.mock.calls[nthCall - 1];

		if (JSON.stringify(args) !== JSON.stringify(expected)) {
			return {
				message: () => {
					return `expected function to have been called with ${JSON.stringify(expected)} on the ${nthCall} time,
but instead it was called with ${JSON.stringify(args)}`;
				},
				pass: false
			};
		} else {
			return {
				message: () => `all the expectations where correct`,
				pass: true
			};
		}
	}
});
