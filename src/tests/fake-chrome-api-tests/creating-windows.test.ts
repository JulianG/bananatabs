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
		await chrome.windows.create({ focused: true });

		// expect the first window to be focused
		const wins = await chrome.windows.getAll({});
		expect(wins[0].focused).toBe(true);

	});

	test('creating a window: not focused', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);

		// when a widow is created with focused: false		
		await chrome.windows.create({ focused: false });

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
		await chrome.windows.create({ focused: true });

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
		await chrome.windows.create({ focused: true });

		// when a second widow is created with focused: true
		await chrome.windows.create({ focused: true });

		// expect the focuse to shift to the second window
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(2);
		expect(wins[0].focused).toBe(false);
		expect(wins[1].focused).toBe(true);

	});

	test('creating a window with a list of tabs', async () => {

		// given no windows
		const chrome = new FakePromisingChromeAPI([]);

		// when a widow is created with 3 urls		
		const urls = ['url0', 'url1', 'url2'];
		await chrome.windows.create({ url: urls });

		// expect a window with 3 tabs with the correct urls
		const wins = await chrome.windows.getAll({});
		expect(wins).toHaveLength(1);
		expect(wins[0].tabs!).toHaveLength(3);
		expect(wins[0].tabs![0].url).toEqual(urls[0]);
		expect(wins[0].tabs![1].url).toEqual(urls[1]);
		expect(wins[0].tabs![2].url).toEqual(urls[2]);

		// also expect only the most recent tab to be active
		expect(wins[0].tabs![0].active).toBe(false);
		expect(wins[0].tabs![1].active).toBe(false);
		expect(wins[0].tabs![2].active).toBe(true);
	});

});
