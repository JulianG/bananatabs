import { FakePromisingChromeAPI } from '../chrome-api/FakePromisingChromeAPI';
import { AllCallbacks } from './expect-extend-functions';

export function getAllCallbacks(fchrome: FakePromisingChromeAPI) {
  const allCallbacks: AllCallbacks = [
    {
      id: 'chrome.windows.onCreated',
      event: fchrome.windows.onCreated,
      callback: jest.fn()
    },
    {
      id: 'chrome.windows.onFocusChanged',
      event: fchrome.windows.onFocusChanged,
      callback: jest.fn()
    },
    {
      id: 'chrome.windows.onRemoved',
      event: fchrome.windows.onRemoved,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onCreated',
      event: fchrome.tabs.onCreated,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onActivated',
      event: fchrome.tabs.onActivated,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onAttached',
      event: fchrome.tabs.onAttached,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onMoved',
      event: fchrome.tabs.onMoved,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onRemoved',
      event: fchrome.tabs.onRemoved,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onUpdated',
      event: fchrome.tabs.onUpdated,
      callback: jest.fn()
    },
    {
      id: 'chrome.tabs.onHighlighted',
      event: fchrome.tabs.onHighlighted,
      callback: jest.fn()
    }
  ];

  hookAllCallbacks(allCallbacks);

  return allCallbacks;
}

function hookAllCallbacks(allCallbacks: AllCallbacks) {
  allCallbacks.forEach(entry => {
    entry.callback.mockClear();
    entry.callback.mockReset();
    entry.event.addListener(entry.callback);
  });
}

export function resetAllCallbacks(allCallbacks: AllCallbacks) {
  allCallbacks.forEach(entry => {
    entry.callback.mockClear();
    entry.callback.mockReset();
  });
}

export function countCalls(allCallbacks: AllCallbacks) {
  console.log(
    allCallbacks.map(
      entry => `${entry.id}: ${entry.callback.mock.calls.length}`
    )
  );
}
