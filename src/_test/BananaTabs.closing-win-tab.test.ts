import 'react-testing-library/cleanup-after-each';

// import { fireEvent /*, getByTestId, cleanup*/ } from 'react-testing-library';

import {
  getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait, compareSessions } from '../_test-utils';

// import { stringToSession } from '../serialisation/MarkdownSerialisation';

describe('BananaTabs Tests: Interaction from browser', async () => {
  //
  test('closing one of many tabs (from the fake browser)', async () => {
    // given an initial state with 1 window and 3 tabs
    const { container, fchrome, provider } = await renderBananaTabs(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/
    `);
    await wait(1);

    const tabId = fchrome.fakeWindows[0].tabs![2].id!;

    // when closing a tab from the (fake) browser
    fchrome.tabs.remove(tabId);
    await wait();

    // expect only 2 tabs in the window
    expect(provider.session.windows[0].tabs).toHaveLength(2);
  });

  test('closing the only tab in a window (from the fake browser)', async () => {
    // given an initial state with 2 windows
    const { container, fchrome, provider } = await renderBananaTabs(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/
      * 
      window 2:
      * http://tab-2.1/
    `);
    await wait(1);

    const tabId = fchrome.fakeWindows[1].tabs![0].id!;

    // when closing the only tab in a window
    fchrome.tabs.remove(tabId);
    await wait(100);

    // expect only 1 window in the fake browser
    const fchws = await fchrome.windows.getAll({});
    expect(fchws).toHaveLength(1);

    // expect 2 windows in bananatabs
    expect(provider.session.windows).toHaveLength(2);

    // the affected window is now hidden and it still contains the last tab
    expect(provider.session.windows[1].visible).toBe(false);
    expect(provider.session.windows[1].tabs).toHaveLength(1);

  });

  test.skip('closing unnamed window from the browser', () => {
    // TODO: write this
  });

  test.skip('closing named window from the browser', () => {
    // TODO: write this
  });
});
