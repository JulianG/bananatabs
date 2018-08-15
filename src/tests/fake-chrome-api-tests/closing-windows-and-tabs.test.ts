import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';

describe('closing windows and tabs', async () => {

	test('closing a window with 1 tab', async () => {

		// given 1 window
		const chrome = new FakePromisingChromeAPI([]);
		await chrome.windows.create({});
		const windowId = (await chrome.windows.getAll({}))[0].id;
		const onWinRemovedCallback = jest.fn();
		chrome.windows.onRemoved.addListener(onWinRemovedCallback);
		const onTabRemovedCallback = jest.fn();
		chrome.tabs.onRemoved.addListener(onTabRemovedCallback);

		// when the window is closed
		await chrome.windows.remove(windowId);

		// expect no windows
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(0);

		// also expect some events
		expect(onWinRemovedCallback).toHaveBeenCalledTimes(1);
		expect(onTabRemovedCallback).toHaveBeenCalledTimes(1);

	});

	test('closing a window with 2 tabs', async () => {

		// given 1 window
		const chrome = new FakePromisingChromeAPI([]);
		await chrome.windows.create({});
		const windowId = (await chrome.windows.getAll({}))[0].id;

		await chrome.tabs.create({windowId});

		const onWinRemovedCallback = jest.fn();
		chrome.windows.onRemoved.addListener(onWinRemovedCallback);
		const onTabRemovedCallback = jest.fn();
		chrome.tabs.onRemoved.addListener(onTabRemovedCallback);

		// when the window is closed
		await chrome.windows.remove(windowId);

		// expect no windows
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(0);

		// also expect some events
		expect(onWinRemovedCallback).toHaveBeenCalledTimes(1);
		expect(onTabRemovedCallback).toHaveBeenCalledTimes(2);

	});
});
