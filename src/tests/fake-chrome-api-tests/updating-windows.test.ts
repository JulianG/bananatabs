import FakePromisingChromeAPI from '../../chrome-api/FakePromisingChromeAPI';
import * as Utils from './chrome-events-utils';

describe('updating windows', async () => {

	test('resizing a window', async () => {

		// given 1 window
		const fchrome = await Utils.initialiseFchrome([1], 0);
		// const fchrome = new FakePromisingChromeAPI([]);
		await fchrome.windows.create({ focused: true });
		const windowId = (await fchrome.windows.getAll({}))[0].id;
		const allCallbacks = Utils.getAllCallbacks(fchrome);
		const initialWins = await fchrome.windows.getAll({});

		const width = initialWins[0].width;

		// when the window is resized
		const updateInfo: chrome.windows.UpdateInfo = {
			top: 10,
			left: 11,
			width: 0,
			height: 450,
		};
		const updateResult = await fchrome.windows.update(windowId, updateInfo);

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
		const fchrome = await Utils.initialiseFchrome([2], 0);
		const initialWins = await fchrome.windows.getAll({});
		const firstTabId = initialWins[0].tabs![0].id!;
		const allCallbacks = Utils.getAllCallbacks(fchrome);

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


