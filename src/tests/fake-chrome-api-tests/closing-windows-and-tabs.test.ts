import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';
import * as Utils from './chrome-events-utils';

describe('closing windows and tabs', async () => {

	test('closing a focused window with 1 tab', async () => {

		// given 1 window
		const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const windowId = (await fchrome.windows.getAll({}))[0].id;
		const allCallbacks = Utils.getAllCallbacks(fchrome);

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
		const allCallbacks = Utils.getAllCallbacks(fchrome);

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
		await fchrome.windows.create({focused: true});
		const windowId = (await fchrome.windows.getAll({}))[0].id;

		await fchrome.tabs.create({ windowId });
		const allCallbacks = Utils.getAllCallbacks(fchrome);

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
