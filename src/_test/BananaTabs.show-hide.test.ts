import { fireEvent /*, getByTestId, cleanup*/ } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import {
  /*getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,*/
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait, compareSessions } from '../_test-utils';

import { stringToSession, windowsToString } from '../serialisation/MarkdownSerialisation';

describe('BananaTabs Tests: Toggling Visibility', async () => {
  //
  describe('Hiding and Showing Tabs', async () => {
    //

    test('hiding tab', async () => {
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

    test.skip('showing hidden tab in visible window', async () => {
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


      console.log(windowsToString(provider.session.windows));
      console.log('...');
      console.log('...');
      console.log('...');
      console.log('...');
      

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

    test.skip('showing hidden tab in hidden window', () => {
      // TODO: write this
    });
  });
  
  describe('Hiding and Showing Windows', async () => {
    test.skip('hiding unnamed window', () => {
      // TODO: write this
    });

    test.skip('hiding named window', () => {
      // TODO: write this
    });

    test.skip('showing hidden window', () => {
      // TODO: write this
    });
  });
});
