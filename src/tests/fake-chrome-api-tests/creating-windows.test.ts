import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';

describe('creating windows', async () => {

	test('creating a window: content', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);

		// when a widow		
		await chrome.windows.create({});

		// expect one window with one tab
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(1);
		expect(wins[0].tabs).toHaveLength(1);

	});

	test('creating a window: events', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);
		const onWinCreatedCallback = jest.fn();
		chrome.windows.onCreated.addListener(onWinCreatedCallback);
		const onTabCreatedCallback = jest.fn();
		chrome.tabs.onCreated.addListener(onTabCreatedCallback);

		// when a widow is created
		await chrome.windows.create({});

		// expect two events
		expect(onWinCreatedCallback).toHaveBeenCalledTimes(1);
		expect(onTabCreatedCallback).toHaveBeenCalledTimes(1);

	});

	test('creating a window: focused', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);

		// when a widow is created with focused: true		
		await chrome.windows.create({focused: true});

		// expect the first window to be focused
		const wins = await chrome.windows.getAll({});
		expect(wins[0].focused).toBe(true);

	});

	test('creating a window: not focused', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);

		// when a widow is created with focused: false		
		await chrome.windows.create({focused: false});

		// expect the first window NOT to be focused
		const wins = await chrome.windows.getAll({});
		expect(wins[0].focused).toBe(false);

	});

	test('creating a window: focused not specified', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);

		// when a widow is created without specifying focus
		await chrome.windows.create({});

		// expect the first window NOT to be focused
		const wins = await chrome.windows.getAll({});
		expect(wins[0].focused).toBe(false);

	});

	test('creating a second window: not focused', async () => {

		// given one focused window
		const chrome = new FakePromisingChromeAPI([]);
		await chrome.windows.create({focused: true});

		// when a second widow is created without specifying focus
		await chrome.windows.create({});

		// expect the first window to remain focused
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(2);
		expect(wins[0].focused).toBe(true);
		expect(wins[1].focused).toBe(false);

	});

	test('creating a second window: focused', async () => {

		// given one focused window
		const chrome = new FakePromisingChromeAPI([]);
		await chrome.windows.create({focused: true});

		// when a second widow is created with focused: true
		await chrome.windows.create({focused: true});

		// expect the focuse to shift to the second window
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(2);
		expect(wins[0].focused).toBe(false);
		expect(wins[1].focused).toBe(true);

	});

});
