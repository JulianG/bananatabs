import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';
import * as Utils from './chrome-events-utils';

describe('creating windows', async () => {

	test('creating a window: content and events', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a window is created		
		await fchrome.windows.create({});

		// expect one window with one tab
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(1);
		expect(wins[0].tabs).toHaveLength(1);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 }
		]);

	});

	test('creating a window: focused', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a widow is created with focused: true		
		await fchrome.windows.create({ focused: true });

		// expect the first window to be focused
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].focused).toBe(true);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.windows.onFocusChanged, times: 1},
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 }
		]);

	});

	test('creating a window: not focused', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a widow is created with focused: false		
		await fchrome.windows.create({ focused: false });

		// expect the first window NOT to be focused
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].focused).toBe(false);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 }
		]);

	});

	test('creating a window: focus not specified', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a widow is created without specifying focus
		await fchrome.windows.create({});

		// expect the first window NOT to be focused
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].focused).toBe(false);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 }
		]);

	});

	test('creating a second window: not focused', async () => {

		// given one focused window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a second widow is created without specifying focus
		await fchrome.windows.create({});

		// expect the first window to remain focused
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(2);
		expect(wins[0].focused).toBe(true);
		expect(wins[1].focused).toBe(false);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 }
		]);

	});

	test('creating a second window: focused', async () => {

		// given one focused window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a second widow is created with focused: true
		await fchrome.windows.create({ focused: true });

		// expect the focuse to shift to the second window
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(2);
		expect(wins[0].focused).toBe(false);
		expect(wins[1].focused).toBe(true);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.windows.onFocusChanged, times: 1},
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 }
		]);

	});

	test('creating a window with a list of tabs', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a widow is created with 3 urls		
		const urls = ['url0', 'url1', 'url2'];
		await fchrome.windows.create({ url: urls });

		// expect a window with 3 tabs with the correct urls
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(1);
		expect(wins[0].tabs!).toHaveLength(3);
		expect(wins[0].tabs![0].url).toEqual(urls[0]);
		expect(wins[0].tabs![1].url).toEqual(urls[1]);
		expect(wins[0].tabs![2].url).toEqual(urls[2]);

		// also expect only the most recent tab to be active
		expect(wins[0].tabs![0].active).toBe(false);
		expect(wins[0].tabs![1].active).toBe(false);
		expect(wins[0].tabs![2].active).toBe(true);

		// also expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 3 },
			{ event: fchrome.tabs.onActivated, times: 3 }
		]);
	});

});
