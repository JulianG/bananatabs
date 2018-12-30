import 'react-testing-library/cleanup-after-each';

import {
  getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,
  renderBananaTabs,
} from '../_test-utils/bananatabs.utils';

import { wait } from '../_test-utils';

describe('BananaTabs Tests: Initial State', async () => {
  //
  test('initial UI snapshot', async () => {
    //
    // given an initial state with 2 windows
    const windows = `
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
    const { container } = await renderBananaTabs(windows);
    await wait(1);

    // expect the rendered output to match the snapshot
    expect(container).toMatchSnapshot();
  });

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
    const stored = live;

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
    expect(getTabsVisibilities(getTabsInWindow(window1))).toMatchObject([
      true,
      true,
      true,
    ]);

    // also expect 3 visible tabs in the second window
    expect(getTabsVisibilities(getTabsInWindow(window2))).toMatchObject([
      true,
      true,
      true,
    ]);
    // as described in the initialisation strings
  });
});
