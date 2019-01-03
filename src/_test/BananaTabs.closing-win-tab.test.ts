import 'react-testing-library/cleanup-after-each';

import { renderBananaTabs } from '../_test-utils/bananatabs.utils';
import { wait } from '../_test-utils';

describe('BananaTabs Tests: Interaction from browser', () => {
  //
  describe('Closing windows and tabs from browser', () => {
    test('closing one of many tabs (from the fake browser)', async () => {
      // given an initial state with 1 window and 3 tabs
      const { fchrome, provider } = await renderBananaTabs(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/
    `);

      const tabId = fchrome.fakeWindows[0].tabs![2].id!;

      // when closing a tab from the (fake) browser
      fchrome.tabs.remove(tabId);
      await wait();

      // expect only 2 tabs in the window
      expect(provider.session.windows[0].tabs).toHaveLength(2);
    });

    test('closing the only tab in a window (from the fake browser)', async () => {
      // given an initial state with 2 windows
      const { fchrome, provider } = await renderBananaTabs(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/
      * 
      window 2:
      * http://tab-2.1/
    `);

      const tabId = fchrome.fakeWindows[1].tabs![0].id!;

      // when closing the only tab in a window
      fchrome.tabs.remove(tabId);
      await wait();

      // expect only 1 window in the fake browser
      const fchws = await fchrome.windows.getAll({});
      expect(fchws).toHaveLength(1);

      // expect 2 windows in bananatabs
      expect(provider.session.windows).toHaveLength(2);

      // the affected window is now hidden and it still contains the last tab
      expect(provider.session.windows[1].visible).toBe(false);
      expect(provider.session.windows[1].tabs).toHaveLength(1);
    });

    test('closing unnamed window from the browser', async () => {
      // given an initial state with 2 windows
      const { fchrome, provider } = await renderBananaTabs(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/
      * 
      :
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/
    `);

      // when closing an unnamed window
      await fchrome.windows.remove(fchrome.fakeWindows[1].id!);
      await wait();

      // expect only 1 window in the fake browser
      const fchws = await fchrome.windows.getAll({});
      expect(fchws).toHaveLength(1);

      // expect only 1 window in bananatabs
      expect(provider.session.windows).toHaveLength(1);
    });

    test('closing named window from the browser', async () => {
      // given an initial state with 2 windows
      const { fchrome, provider } = await renderBananaTabs(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/
      * 
      :
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/
    `);

      // when closing an unnamed window
      await fchrome.windows.remove(fchrome.fakeWindows[0].id!);
      await wait();

      // expect only 1 window in the fake browser
      const fchws = await fchrome.windows.getAll({});
      expect(fchws).toHaveLength(1);

      // expect 2 windows in bananatabs
      expect(provider.session.windows).toHaveLength(2);

      // expect the affected window to be hidden
      expect(provider.session.windows[0].visible).toBe(false);
    });
  });

  describe('Creating new windows and tabs from browser', () => {
    //
    test.skip('Creating a new window', async () => {
      //
    });

    test.skip('Creating a new tab in an existing window', async () => {
      //
    });

  });

  describe('Drag and drop tabs from browser', () => {
    //

    test.skip('Rearranging tab order within the same window', async () => {
      //
    });

    test.skip('when dragging a tab to a new window', () => {
      //
    });

    test.skip('when dropping a tab to an existing window', () => {
      //
    });
  });
});
