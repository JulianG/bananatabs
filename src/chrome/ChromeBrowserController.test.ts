import * as BT from '../model/core/CoreTypes';
import { ChromeBrowserController } from './ChromeBrowserController';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

describe('ChromeBrowserController', async () => {
  describe('Getter Functions', async () => {
    test('getAllWindows', async () => {
      // given a controller with two windows, containing 2 and 3 tabs each
      const fchrome = initialiseFakeChromeAPI('[v(v,v)][v(v,v,v)]');
      const controller = new ChromeBrowserController(fchrome);

      // when calling getAllWindows
      const wins = await controller.getAllWindows();

      // expect the list of windows should match
      expect(wins).toHaveLength(2);
      expect(wins[0].tabs).toHaveLength(2);
      expect(wins[1].tabs).toHaveLength(3);
    });

    test('getDisplayInfo', async () => {
      // given a controller with two windows
      const fchrome = initialiseFakeChromeAPI('[v(v,v)],[v(v,v,v)]'); // [2, 3], -1
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
      const fchrome = initialiseFakeChromeAPI(''); // [], -1
      const controller = new ChromeBrowserController(fchrome);

      // when calling getAppURL
      const appURL = await controller.getAppURL();

      // expect the string to have the expected value
      expect(appURL).toBe('chrome-extension://index.html');
    });
  });

  describe('Window Functions', async () => {
    test('showWindow', async () => {
      // given a controller with no windows
      const fchrome = initialiseFakeChromeAPI('');
      const controller = new ChromeBrowserController(fchrome);
      const callback = jest.fn();
      controller.addEventListener(callback);

      // when calling showWindow
      await controller.showWindow(BT.getNewWindow());

      // expect the list of windows to have 1 element
      const wins = await controller.getAllWindows();
      expect(wins).toHaveLength(1);

      // also expect the following events
      expect(callback.mock.calls.map((args) => args[0])).toMatchObject([
        'onTabsCreated',
        'onActivated',
        'onTabsCreated',
        'onActivated',
        'onRemoved',
      ]);
    });

    test('closeWindow', async () => {
      // given a controller with one visible window and one visible tab
      const fchrome = initialiseFakeChromeAPI('[vf(v)]');
      const controller = new ChromeBrowserController(fchrome);
      const callback = jest.fn();
      controller.addEventListener(callback);
      const initialWindows = await controller.getAllWindows();

      // when closing the only window
      await controller.closeWindow(initialWindows[0].id);

      // expect the list of windows to be empty
      const wins = await controller.getAllWindows();
      expect(wins).toHaveLength(0);

      // also expect the following events
      expect(callback.mock.calls.map((args) => args[0])).toMatchObject([
        'onFocusChanged',
        'onRemoved',
      ]);
    });
  });

  describe('Tab Functions', async () => {
    test('createTab in window with one tab', async () => {
      // given a controller with one visible window and one visible tab
      const fchrome = initialiseFakeChromeAPI('[vf(v)]');
      const controller = new ChromeBrowserController(fchrome);
      const callback = jest.fn();
      controller.addEventListener(callback);
      const initialWindows = await controller.getAllWindows();

      // when calling createTab
      const t = { ...BT.getNewTab(), id: 1001 };
      await controller.showTab(initialWindows[0], t);

      // expect the list of tabs to have 2 visible tabs
      const wins = await controller.getAllWindows();
      expect(wins[0].tabs).toHaveLength(2);
      expect(wins[0].tabs[0].visible).toBeTruthy();
      expect(wins[0].tabs[1].visible).toBeTruthy();

      // also expect the following events
      expect(callback.mock.calls.map((args) => args[0])).toMatchObject([
        'onTabsCreated',
      ]);

      await controller.closeTab(wins[0].tabs[0].id);

      const wins1 = await controller.getAllWindows();
      expect(wins1[0].tabs).toHaveLength(1);
    });

    test('closeTab in window with two tabs', async () => {
      // given a controller with one visible window and two tabs
      const fchrome = initialiseFakeChromeAPI('[vf(v,v)]');
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

      // also expect the following events
      expect(callback.mock.calls.map((args) => args[0])).toMatchObject([
        'onTabsRemoved',
      ]);
    });

    test('selectTab', async () => {
      // given a controller with two windows
      const fchrome = initialiseFakeChromeAPI('[v(v,v)],[v(v,v,v)]');
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
  });

  describe('Docking App Window', async () => {
    test('dockAppWindow', async () => {
      // given a controller with an app (extension) window
      const fchrome = initialiseFakeChromeAPI('');
      fchrome.windows.create({ url: 'chrome-extension://index.html' });
      const controller = new ChromeBrowserController(fchrome);

      const appURL = await controller.getAppURL();
      const [display] = await controller.getDisplayInfo();

      // when docking the app window to the right
      await controller.dockAppWindow('right', 5);

      const [windowRight] = await controller.getAllWindows();

      // expect the app window
      expect(windowRight.tabs[0].url).toBe(appURL);

      // to be in the expected position
      expect(windowRight.bounds).toMatchObject({
        top: 0,
        left: (display.bounds.width * 4) / 5,
        width: display.bounds.width / 5,
        height: display.bounds.height,
      });

      // when docking the app window to the left
      await controller.dockAppWindow('left', 5);

      const [windowLeft] = await controller.getAllWindows();

      // expect the app window
      expect(windowLeft.tabs[0].url).toBe(appURL);

      // to be in the expected position
      expect(windowLeft.bounds).toMatchObject({
        top: 0,
        left: 0,
        width: display.bounds.width / 5,
        height: display.bounds.height,
      });
    });
  });
});
