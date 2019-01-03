import { fireEvent /*, getByTestId, cleanup*/ } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import {
  /*getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,*/
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait, compareSessions } from '../_test-utils';

import {
  stringToSession
  /*windowsToString*/
} from '../serialisation/MarkdownSerialisation';

describe('BananaTabs Tests: Toggling Visibility', async () => {
  //
  describe('Hiding and Showing Tabs', async () => {
    //
    test('hiding a tab in a window with multiple tabs', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getTabVisibilityToggle
      } = await renderBananaTabs(`
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/

        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to hide a tab is clicked
      const btn = getTabVisibilityToggle(0, 1);
      fireEvent.click(btn);

      // expect the tab to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      window 1:
      * http://tab-1.1/
      ~ http://tab-1.2/
      * http://tab-1.3/

      window 2:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect only two tabs in fchrome
      await wait(2);
      expect(fchrome.fakeWindows[0].tabs!).toHaveLength(2);
    });

    test('hiding the only tab in a window', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getTabVisibilityToggle
      } = await renderBananaTabs(`
        window 1:
        * http://tab-1.1/

        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to hide a tab is clicked
      const btn = getTabVisibilityToggle(0, 0);
      fireEvent.click(btn);

      // expect the tab to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      window 1:
      ~ http://tab-1.1/

      window 2:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect only two tabs in fchrome
      await wait();
      expect(fchrome.fakeWindows).toHaveLength(1);
    });

    test('showing hidden tab in visible window', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getTabVisibilityToggle
      } = await renderBananaTabs(`
        window 1:
        * http://tab-1.1/
        ~ http://tab-1.2/
        * http://tab-1.3/

        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to show a tab is clicked
      const btn = getTabVisibilityToggle(0, 1);
      fireEvent.click(btn);

      // expect the tab to be visible!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/

      window 2:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect three tabs in fchrome
      await wait(2);
      expect(fchrome.fakeWindows[0].tabs!).toHaveLength(3);
    });

    test('showing hidden tab in hidden window', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getTabVisibilityToggle
      } = await renderBananaTabs(`
        window 1~
        * http://tab-1.1/
        ~ http://tab-1.2/
        * http://tab-1.3/

        window 2:
        * http://tab-2.1/
      `);

      // when the button to show a tab is clicked
      const btn = getTabVisibilityToggle(0, 1);
      fireEvent.click(btn);

      await wait();

      // expect the tab to be visible and the window to become visible
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/

      window 2:
      * http://tab-2.1/
      `)
        )
      ).toBe(true);

      // also expect two tabs in fchrome (one more than before)
      await wait();
      expect(fchrome.fakeWindows).toHaveLength(2);
    });
  });

  describe('Hiding and Showing Windows', async () => {
    //
    test('hiding unnamed window', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getWindowVisibilityToggle
      } = await renderBananaTabs(`
        :
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/

        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to hide a window is clicked
      const btn = getWindowVisibilityToggle(0);
      fireEvent.click(btn);
      await wait();

      // expect the window to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      My Window~
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/

      window 2:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect only one window in fchrome
      expect(fchrome.fakeWindows).toHaveLength(1);
      await wait();
    });

    test('hiding named window', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getWindowVisibilityToggle
      } = await renderBananaTabs(`
        This window has a name:
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/

        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to hide a window is clicked
      const btn = getWindowVisibilityToggle(0);
      fireEvent.click(btn);
      await wait();

      // expect the window to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      This window has a name~
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/

      window 2:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect only one window in fchrome
      expect(fchrome.fakeWindows).toHaveLength(1);
      await wait();
    });

    test('showing hidden window', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getWindowVisibilityToggle
      } = await renderBananaTabs(`
        My Hidden Window~
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/

        My Visible Window:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to show a hidden window
      const btn = getWindowVisibilityToggle(0);
      fireEvent.click(btn);
      await wait();

      // expect the tab to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      My Hidden Window:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/

      My Visible Window:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect two windows in fchrome
      expect(fchrome.fakeWindows).toHaveLength(2);
      await wait();
    });

    test('showing a hidden window then hiding it again', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getWindowVisibilityToggle
      } = await renderBananaTabs(`
        My Hidden Window~
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/

        My Visible Window:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);

      // when the button to show a hidden window
      fireEvent.click(getWindowVisibilityToggle(0));
      await wait();

      // expect the tab to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
      My Hidden Window:
      * http://tab-1.1/
      * http://tab-1.2/
      * http://tab-1.3/

      My Visible Window:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `)
        )
      ).toBe(true);

      // also expect two windows in fchrome
      expect(fchrome.fakeWindows).toHaveLength(2);
      await wait();

      // then we'll show the window again

      // when the button to hide the same window is clicked
      fireEvent.click(getWindowVisibilityToggle(0));
      await wait();

      // expect the tab to be hidden!
      expect(
        compareSessions(
          provider.session,
          stringToSession(`
            My Hidden Window~
            * http://tab-1.1/
            * http://tab-1.2/
            * http://tab-1.3/
      
            My Visible Window:
            * http://tab-2.1/
            * http://tab-2.2/
            * http://tab-2.3/   
            `)
        )
      ).toBe(true);

      // also expect two windows in fchrome
      expect(fchrome.fakeWindows).toHaveLength(1);
      await wait();
    });
  });
});
