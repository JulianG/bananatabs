import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';

describe('creating tabs', async () => {

	test('creating a tab: content', async () => {

		// given one window with a default tab
		const chrome = new FakePromisingChromeAPI([]);
		const window0 = await chrome.windows.create({focused: true});
		
		// when a tab is created
		const windowId = window0!.id;
		await chrome.tabs.create({ windowId });

		// expect the window to have 2 tabs
		const wins = await chrome.windows.getAll({});
		expect(wins[0].tabs).toHaveLength(2);

	});

	test('creating a tab in the first window: events', async () => {

		// given one window
		const chrome = new FakePromisingChromeAPI([]);
		const window0 = await chrome.windows.create({focused: true});
		
		// when a tab is created 
		const onTabCreatedCallback = jest.fn();
		chrome.tabs.onCreated.addListener(onTabCreatedCallback);
		const windowId = window0!.id;
		await chrome.tabs.create({ windowId });

		// also expect an event
		expect(onTabCreatedCallback).toHaveBeenCalledTimes(1);		

	});

	test('creating a tab in the first window', async () => {

		// given two windows
		const chrome = new FakePromisingChromeAPI([]);
		const window0 = await chrome.windows.create({focused: true});
		await chrome.windows.create({});
		
		// when a tab is created on the first window
		const windowId = window0!.id;
		await chrome.tabs.create({ windowId });

		// expect the first window to have 2 tabs
		const wins = await chrome.windows.getAll({});
		expect(wins[0].tabs).toHaveLength(2);
		
		// also expect the first window to remain focused
		expect(wins[0].focused).toBe(true);

	});

	// more variants of this

});
