import * as BT from '../model/CoreTypes';

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

function confirmExpectations(
  allCallbacks: AllCallbacks,
  expectations: Expectation[]
) {
  for (let i = 0; i < allCallbacks.length; i++) {
    const pair = allCallbacks[i];

    const expectation = expectations.find(ex => ex.event === pair.event);
    const times = expectation ? expectation.times : 0;

    if (pair.callback.mock.calls.length !== times) {
      return {
        message: () => {
          return (
            `expected event '${pair.id}' \nto have been triggered: ` +
            `  ${times} times, but` +
            `\ninstead it was triggered:` +
            ` ${pair.callback.mock.calls.length} times.`
          );
        },
        pass: false,
      };
    }
  }

  return {
    message: () => `all the expectations where correct`,
    pass: true,
  };
}

// this extension is here because `toHaveBeenNthCalledWith` seems to have disappeared
expect.extend({
  toHaveBeenCalledNthTimeWith: (
    fn: jest.Mock<{}>,
    nthCall: number,
    expected: {}
  ) => {
    if (fn.mock.calls.length < nthCall) {
      return {
        message: () => {
          return `expected function to have been called at least ${nthCall} times,
but it was instead called ${fn.mock.calls.length} times`;
        },
        pass: false,
      };
    }

    const args = fn.mock.calls[nthCall - 1];

    if (JSON.stringify(args) !== JSON.stringify(expected)) {
      return {
        message: () => {
          return `expected function to have been called with ${JSON.stringify(
            expected
          )} on the ${nthCall} time,
but instead it was called with ${JSON.stringify(args)}`;
        },
        pass: false,
      };
    } else {
      return {
        message: () => `all the expectations where correct`,
        pass: true,
      };
    }
  },
});

// ///

expect.extend({
  toBeEquivalentToBTWindow: (
    actual: chrome.windows.Window,
    expected: BT.Window
  ) => {
    const visiblePass = expected.visible;
    const focusPass = actual.focused === expected.focused;
    const actualURLs = (actual.tabs || []).map(t => t.url);
    const expectedURLs = expected.tabs.filter(t => t.visible).map(t => t.url);
    const urlsLengthPass = actualURLs.length === expectedURLs.length;
    const urlsPass = actualURLs.every((url, i) => url === expectedURLs[i]);

    if (focusPass && urlsLengthPass && urlsPass && visiblePass) {
      return {
        message: () =>
          `expected windows not to be equivalent, but they have the same 'focused' value and same list of tabs.`,
        pass: true,
      };
    } else {
      let message = '';

      if (!visiblePass) {
        message = `the expected window must be visible`;
      } else if (!focusPass) {
        message = `expected focused to be ${
          expected.focused
        }, but instead it was ${actual.focused}`;
      } else if (!urlsLengthPass || !urlsPass) {
        message = `expected URLs to be ${JSON.stringify(expectedURLs, null, 2)},
but instead it was ${JSON.stringify(actualURLs, null, 2)}`;
      }
      return { message: () => message, pass: false };
    }
  },
});
