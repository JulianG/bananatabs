import * as React from 'react';
import { render } from 'react-testing-library';
import {
  getFactory,
  getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,
  wait
} from './__test__/bananatabs.utils';

import BananaTabs from './BananaTabs';
import { stringToWindows } from './serialisation/MarkdownSerialisation';

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
    const { container, debug } = render(
      <BananaTabs factory={getFactory(live, stored)} />
    );
    // and we wait
    await wait();

    // expect 2 window groups
    // because the live windows were matched to stored windows
    const windowGroups = getWindowGroups(container);
    expect(windowGroups).toHaveLength(2);

    const [window1, window2] = windowGroups;

    // also expect 3 visible tabs in the first window
    expect(getTabsVisibilities(getTabsInWindow(window1))).toMatchObject([
      true,
      true,
      true
    ]);

    // also expect 3 visible tabs in the second window
    expect(getTabsVisibilities(getTabsInWindow(window2))).toMatchObject([
      true,
      true,
      true
    ]);
    // as described in the initialisation strings
  });
});
