import FakePromisingChromeAPI from './FakePromisingChromeAPI';
import '../utils/test-utils/chrome-events-utils';
import { initialiseFchrome, getAllCallbacks } from '../utils/test-utils/fake-chrome-test-factory';

describe('FakePromisingChromeAPI closing windows and tabs', async () => {

	test('closing a focused window with 1 tab', async () => {

		// given 1 window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const windowId = (await fchrome.windows.getAll({}))[0].id;
		const allCallbacks = getAllCallbacks(fchrome);

		// when the window is closed
		await fchrome.windows.remove(windowId);

		// expect no windows
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(0);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.tabs.onRemoved, times: 1 },
			{ event: fchrome.windows.onFocusChanged, times: 1 },
			{ event: fchrome.windows.onRemoved, times: 1 }
		]);

	});

	test('closing a non focused window with 1 tab', async () => {

		// given 1 window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: false });
		const windowId = (await fchrome.windows.getAll({}))[0].id;
		const allCallbacks = getAllCallbacks(fchrome);

		// when the window is closed
		await fchrome.windows.remove(windowId);

		// expect no windows
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(0);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.tabs.onRemoved, times: 1 },
			{ event: fchrome.windows.onRemoved, times: 1 }
		]);

	});


	test('closing a focused window with 2 tabs', async () => {

		// given 1 window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const windowId = (await fchrome.windows.getAll({}))[0].id;

		await fchrome.tabs.create({ windowId });
		const allCallbacks = getAllCallbacks(fchrome);

		// when the window is closed
		await fchrome.windows.remove(windowId);

		// expect no windows
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(0);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.tabs.onRemoved, times: 2 },
			{ event: fchrome.windows.onFocusChanged, times: 1 },
			{ event: fchrome.windows.onRemoved, times: 1 }
		]);


	});
});

////

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
		const allCallbacks = getAllCallbacks(fchrome);

		// when a second tab is created
		const windowId = window0!.id;
		await fchrome.tabs.create({ windowId });

		// expect the window to have 2 tabs
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs).toHaveLength(2);

		// expect exactly these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a tab: content', async () => {

		// given one window with a default tab
		const fchrome = new FakePromisingChromeAPI([]);
		const window0 = await fchrome.windows.create({ focused: true });
		const allCallbacks = getAllCallbacks(fchrome);

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
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a tab in the first window', async () => {

		// given two windows
		const fchrome = new FakePromisingChromeAPI([]);
		const window0 = await fchrome.windows.create({ focused: true });
		await fchrome.windows.create({});
		const allCallbacks = getAllCallbacks(fchrome);

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
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);


	});

	// more variants of this

});

////

describe('creating windows', async () => {

	test('creating a window: content and events', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = getAllCallbacks(fchrome);

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
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a window: focused', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = getAllCallbacks(fchrome);

		// when a widow is created with focused: true		
		await fchrome.windows.create({ focused: true });

		// expect the first window to be focused
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].focused).toBe(true);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.windows.onFocusChanged, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a window: not focused', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = getAllCallbacks(fchrome);

		// when a widow is created with focused: false		
		await fchrome.windows.create({ focused: false });

		// expect the first window NOT to be focused
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].focused).toBe(false);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a window: focus not specified', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = getAllCallbacks(fchrome);

		// when a widow is created without specifying focus
		await fchrome.windows.create({});

		// expect the first window NOT to be focused
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].focused).toBe(false);

		// expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a second window: not focused', async () => {

		// given one focused window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const allCallbacks = getAllCallbacks(fchrome);

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
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a second window: focused', async () => {

		// given one focused window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const allCallbacks = getAllCallbacks(fchrome);

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
			{ event: fchrome.windows.onFocusChanged, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 1 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('creating a window with a list of tabs', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);
		const allCallbacks = getAllCallbacks(fchrome);

		// when a widow is created with 3 urls		
		const urls = ['url0', 'url1', ''];
		await fchrome.windows.create({ url: urls });

		// expect a window with 3 tabs with the correct urls
		const wins = await fchrome.windows.getAll({});
		expect(wins).toHaveLength(1);
		expect(wins[0].tabs!).toHaveLength(3);
		expect(wins[0].tabs![0].url).toEqual(urls[0]);
		expect(wins[0].tabs![1].url).toEqual(urls[1]);
		expect(wins[0].tabs![2].url).toEqual('chrome://newtab/');

		// also expect only the most recent tab to be active
		expect(wins[0].tabs![0].active).toBe(false);
		expect(wins[0].tabs![1].active).toBe(false);
		expect(wins[0].tabs![2].active).toBe(true);

		// also expect only these events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onCreated, times: 1 },
			{ event: fchrome.tabs.onCreated, times: 3 },
			{ event: fchrome.tabs.onActivated, times: 3 },
			{ event: fchrome.tabs.onHighlighted, times: 3 }
		]);
	});

	test('creating a window: url as string', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);

		// when
		await fchrome.windows.create({ url: 'http://foo.bar' });

		// expect
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs![0].url).toBe('http://foo.bar');

	});

	test('creating a window: url as empty string', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);

		// when
		await fchrome.windows.create({ url: '' });

		// expect
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs![0].url).toBe('chrome://newtab/');

	});
	test('creating a window: url as empty array', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);

		// when
		await fchrome.windows.create({ url: [] });

		// expect
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs![0].url).toBe('chrome://newtab/');

	});

	test('creating a window: url undefined', async () => {

		// given no windows
		const fchrome = new FakePromisingChromeAPI([]);

		// when
		await fchrome.windows.create({ url: undefined });

		// expect
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs![0].url).toBe('chrome://newtab/');

	});

});

////

describe('updating windows', async () => {

	test('resizing a window', async () => {

		// given 1 window
		const fchrome = await initialiseFchrome('[v(v)]');
		// const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const windowId = (await fchrome.windows.getAll({}))[0].id;
		const allCallbacks = getAllCallbacks(fchrome);
		await fchrome.windows.getAll({});

		// when the window is resized
		const updateInfo: chrome.windows.UpdateInfo = {
			top: 10,
			left: 11,
			width: 0,
			height: 450,
		};
		await fchrome.windows.update(windowId, updateInfo);

		// expect the window dimensions to be correct
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].width).toBe(updateInfo.width);
		expect(wins[0].height).toBe(updateInfo.height);
		expect(wins[0].top).toBe(updateInfo.top);
		expect(wins[0].left).toBe(updateInfo.left);

		// expect NO events
		expect(allCallbacks).toHaveBeenCalledLike([]);

	});
});

describe('updating tabs', async () => {

	test('selecting an inactive tab in a focused window', async () => {

		// given 1 focused window with a two tabs
		// const focused = true;
		const fchrome = await initialiseFchrome('[v(v,v)]');
		const initialWins = await fchrome.windows.getAll({});
		const firstTabId = initialWins[0].tabs![0].id!;
		const allCallbacks = getAllCallbacks(fchrome);

		// when the first true is set to active
		const updateProps: chrome.tabs.UpdateProperties = {
			active: true
		};
		const updateResult = await fchrome.tabs.update(firstTabId, updateProps);

		// expect the update result to contain the same tab, but active and highlighted
		expect(updateResult!.active).toBeTruthy();
		expect(updateResult!.highlighted).toBeTruthy();

		// expect only one tab to be active
		const wins = await fchrome.windows.getAll({});
		expect(wins[0].tabs![0].active).toBeTruthy();
		expect(wins[0].tabs![1].active).toBeFalsy();

		// expect the following events
		expect(allCallbacks).toHaveBeenCalledLike([
			{ event: fchrome.windows.onFocusChanged, times: 0 },
			{ event: fchrome.tabs.onActivated, times: 1 },
			{ event: fchrome.tabs.onHighlighted, times: 1 }
		]);

	});

	test('selecting an inactive tab in a non-focused window', async () => {
		// TODO
	});

	test('selecting an tab that is already selected in a focused window', async () => {
		// TODO
	});

	test('selecting an tab that is already selected in a non-focused window', async () => {
		// TODO
	});
});


