import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';
import * as Utils from './chrome-events-utils';

describe('creating tabs', async () => {

	test('creating a tab: active when only tab in window', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
	
		// when creating a window
		await fchrome.windows.create({});

		// expect the new tba to be active
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs![0].active).toBe(true);

	});

	test('creating a tab: content', async () => {

		// given one window with a default tab
		const fchrome = new FakePromisingChromeAPI([]);		
		const window0 = await fchrome.windows.create({ focused: true });
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a second tab is created
		const windowId = window0!.id;
		await fchrome.tabs.create({ windowId });

		// expect the window to have 2 tabs
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs).toHaveLength(2);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{event: fchrome.tabs.onCreated, times: 1},
			{event: fchrome.tabs.onActivated, times: 1}
		]);

	});

	test('creating a tab: content', async () => {

		// given one window with a default tab
		const fchrome = new FakePromisingChromeAPI([]);		
		const window0 = await fchrome.windows.create({ focused: true });
		const allCallbacks = Utils.getAllCallbacks(fchrome);

		// when a second tab is created
		const windowId = window0!.id;
		await fchrome.tabs.create({ windowId });

		// expect the new tab to be active and the previous tab not to be active
		const wins = await fchrome.windows.getAll({});
		const tabs = wins[0].tabs!;
		expect(tabs[0].active).toBe(false);
		expect(tabs[1].active).toBe(true);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{event: fchrome.tabs.onCreated, times: 1},
			{event: fchrome.tabs.onActivated, times: 1}
		]);

	});

	test('creating a tab in the first window', async () => {

		// given two windows
		const fchrome = new FakePromisingChromeAPI([]);		
		const window0 = await fchrome.windows.create({ focused: true });
		await fchrome.windows.create({});
		const allCallbacks = Utils.getAllCallbacks(fchrome);
		
		// when a tab is created on the first window
		const windowId = window0!.id;
		await fchrome.tabs.create({ windowId });

		// expect the first window to have 2 tabs
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs).toHaveLength(2);

		// also expect the first window to remain focused
		expect(wins[0].focused).toBe(true);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{event: fchrome.tabs.onCreated, times: 1},
			{event: fchrome.tabs.onActivated, times: 1}
		]);
		

	});

	// more variants of this

});
