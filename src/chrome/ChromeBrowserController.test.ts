import * as BT from '../model/CoreTypes';
import ChromeBrowserController from './ChromeBrowserController';
import { initialiseFchrome } from '../utils/test-utils/chrome-events-utils';

describe('ChromeEventController', async () => {

	test('getAllWindows', async () => {

		// given a controller with two windows
		const fchrome = await initialiseFchrome([2, 3], -1);
		const controller = new ChromeBrowserController(fchrome);

		// when calling showWindow
		const wins = await controller.getAllWindows();

		// expect the list of windows to have 1 element
		expect(wins).toHaveLength(2);
		expect(wins[0].tabs).toHaveLength(2);
		expect(wins[1].tabs).toHaveLength(3);
	});

	test('showWindow', async () => {

		// given a controller with no windows
		const fchrome = await initialiseFchrome([], -1);
		const controller = new ChromeBrowserController(fchrome);
		const callback = jest.fn();
		controller.addEventListener(callback);

		// when calling showWindow
		await controller.showWindow(BT.getNullWindow());

		// expect the list of windows to have 1 element
		const wins = await controller.getAllWindows();
		expect(wins).toHaveLength(1);

		// also expect NO events to happen (due to event supression)
		expect(callback).toHaveBeenCalledTimes(0);

	});

	test('closeWindow', async () => {

		// given a controller with one visible window and one visible tab
		const fchrome = await initialiseFchrome([1], 0);
		const controller = new ChromeBrowserController(fchrome);
		const callback = jest.fn();
		controller.addEventListener(callback);
		const initialWindows = await controller.getAllWindows();

		// when closing the only window
		await controller.closeWindow(initialWindows[0].id);

		// expect the list of windows to be empty
		const wins = await controller.getAllWindows();
		expect(wins).toHaveLength(0);

		// also expect NO events to happen (due to event supression)
		expect(callback).toHaveBeenCalledTimes(0);
	});

	test('createTab in window with one tab', async () => {

		// given a controller with one visible window and one visible tab
		const fchrome = await initialiseFchrome([1], 0);
		const controller = new ChromeBrowserController(fchrome);
		const callback = jest.fn();
		controller.addEventListener(callback);
		const initialWindows = await controller.getAllWindows();

		// when calling createTab		
		const t = { ...BT.getNullTab(), id: 1001 };
		await controller.createTab(initialWindows[0], t);

		// expect the list of tabs to have 2 visible tabs
		const wins = await controller.getAllWindows();
		expect(wins[0].tabs).toHaveLength(2);
		expect(wins[0].tabs[0].visible).toBeTruthy();
		expect(wins[0].tabs[1].visible).toBeTruthy();

		// also expect NO events to happen (due to event supression)
		expect(callback).toHaveBeenCalledTimes(0);

		await controller.closeTab(wins[0].tabs[0].id);

		const wins1 = await controller.getAllWindows();
		expect(wins1[0].tabs).toHaveLength(1);
	});

	test('closeTab in window with two tabs', async () => {

		// given a controller with one visible window and one hidden tab
		const fchrome = await initialiseFchrome([2], 0);
		const controller = new ChromeBrowserController(fchrome);
		const callback = jest.fn();
		controller.addEventListener(callback);
		const initialWindows = await controller.getAllWindows();

		// when calling closeTab		
		const targetTabId = initialWindows[0].tabs[1].id;
		await controller.closeTab(targetTabId);

		// expect one window with one visible tab
		const wins = await controller.getAllWindows();
		expect(wins[0].tabs).toHaveLength(1);
		expect(wins[0].tabs[0].visible).toBeTruthy();

		// also expect NO events to happen (due to event supression)
		expect(callback).toHaveBeenCalledTimes(0);

	});

	test('closeWindow', async () => {

		// given a controller with one visible window and one hidden tab
		const fchrome = await initialiseFchrome([2], 0);
		const controller = new ChromeBrowserController(fchrome);
		const callback = jest.fn();
		controller.addEventListener(callback);
		const initialWindows = await controller.getAllWindows();

		// when calling closeTab	
		const targetWindowId = initialWindows[0].id;
		await controller.closeWindow(targetWindowId);

		// expect one window with one visible tab
		const wins = await controller.getAllWindows();
		expect(wins).toHaveLength(0);

		// also expect NO events to happen (due to event supression)
		expect(callback).toHaveBeenCalledTimes(0);

	});

	test('selectTab', async () => {

		// given a controller with two windows
		const fchrome = await initialiseFchrome([2, 3], -1);
		const controller = new ChromeBrowserController(fchrome);
		const wins = await controller.getAllWindows();

		// when calling selectTab
		const wId = wins[1].id;
		const tId = wins[1].tabs[0].id;
		await controller.selectTab(wId, tId);

		// expect the the selected tab to be active and highlighted
		const windowsAfter = await controller.getAllWindows();
		const window = windowsAfter[1];

		expect(window.tabs[0].active).toBeTruthy();
		expect(window.tabs[0].highlighted).toBeTruthy();

	});

	test('getDisplayInfo', async () => {

		// given a controller with two windows
		const fchrome = await initialiseFchrome([2, 3], -1);
		const controller = new ChromeBrowserController(fchrome);

		// when calling getDisplayInfo
		const displayInfoList = await controller.getDisplayInfo();

		// expect 1 item in the display info list
		expect(displayInfoList).not.toBeNull();
		expect(displayInfoList[0]).toHaveProperty('id');
		expect(displayInfoList[0]).toHaveProperty('bounds');

	});

	test('getAppURL', async () => {

		// given a controller
		const fchrome = await initialiseFchrome([], -1);
		const controller = new ChromeBrowserController(fchrome);

		// when calling getAppURL
		const appURL = await controller.getAppURL();

		// expect the string to have some length
		expect(appURL.length).toBeGreaterThan(0);

	});


});