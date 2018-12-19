import * as React from 'react';
import { fireEvent, getByTestId, cleanup } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import {
  getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,
  wait,
  renderBananaTabs
} from './__test__/bananatabs.utils';

import { stringToSession } from './serialisation/MarkdownSerialisation';
import { compareSessions } from './utils/test-utils/session-compare-functions';

describe('BananaTabs Tests', async () => {
  //
  test('identical initial states', async () => {
    //
    // given an initial state with
    // 2 live windows
    // and 2 stored windows
    // which are identical

    const live = `
window 1:
 * http://tab-1.1/
 * http://tab-1.2/
 * http://tab-1.3/

window 2:
 * http://tab-2.1/
 * http://tab-2.2/
 * http://tab-2.3/
    `;
    const stored = `
window 1:
 * http://tab-1.1/
 * http://tab-1.2/
 * http://tab-1.3/

window 2:
 * http://tab-2.1/
 * http://tab-2.2/
 * http://tab-2.3/  
    `;

    // when the app starts and is rendered
    const { container, fchrome } = await renderBananaTabs(live, stored);
    await wait(1);
    // expect 2 window groups
    // because the live windows were matched to stored windows
    const windowGroups = getWindowGroups(container);
    expect(windowGroups).toHaveLength(2);
    expect(fchrome.fakeWindows).toHaveLength(2);

    const [window1, window2] = windowGroups;

    // also expect 3 visible tabs in the first window
    expect(getTabsVisibilities(getTabsInWindow(window1))).toMatchObject([true, true, true]);

    // also expect 3 visible tabs in the second window
    expect(getTabsVisibilities(getTabsInWindow(window2))).toMatchObject([true, true, true]);
    // as described in the initialisation strings
  });

  test('hidingtab', async () => {
    //
    // given an initial rendered app
    const { container, fchrome, provider, debug, getTabVisibilityToggle } = await renderBananaTabs(`
    window 1:
     * http://tab-1.1/
     * http://tab-1.2/
     * http://tab-1.3/
    
    window 2:
     * http://tab-2.1/
     * http://tab-2.2/
     * http://tab-2.3/
        `);

    // tslint:disable no-debugger
    debugger;

    // when the button to hide a tab is clicked
    const btn = getTabVisibilityToggle(0, 2);
    fireEvent.click(btn);

    // expect the tab to be hidden!
    const expectedSession = stringToSession(`
window 1:
 * http://tab-1.1/
 * http://tab-1.2/
 ~ http://tab-1.3/

window 2:
 * http://tab-2.1/
 * http://tab-2.2/
 * http://tab-2.3/  
    `);

    expect(compareSessions(expectedSession, provider.session)).toBeTruthy();

    // also expect only two tabs in fchrome
    await wait(2);
    expect(fchrome.fakeWindows[0].tabs!).toHaveLength(3); // this should be 2
    // ///////////////////////////
    // why is this not working!?!?
    // ///////////////////////////
  });
});