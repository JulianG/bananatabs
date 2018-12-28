import { fireEvent /*, getByTestId, cleanup*/ } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import {
  /*getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,*/
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait, compareSessions } from '../_test-utils';

import { stringToSession } from '../serialisation/MarkdownSerialisation';

describe('BananaTabs Tests: Toggling Visibility', async () => {
  //
  describe('Hiding and Showing Tabs', async () => {
    //

    const renderInitialBananaTabs = async () => {
      return renderBananaTabs(`
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/

        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
        * http://tab-2.3/
      `);
    };

    test('hiding tab', async () => {
      //
      // given an initial rendered app
      const {
        /*container, debug, */
        fchrome,
        provider,
        getTabVisibilityToggle
      } = await renderInitialBananaTabs();

      // when the button to hide a tab is clicked
      const btn = getTabVisibilityToggle(0, 2);
      fireEvent.click(btn);

      // expect the tab to be hidden!
      expect(compareSessions(provider.session, stringToSession(`
      window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      ~ http://tab-1.3/

      window 2:
      * http://tab-2.1/
      * http://tab-2.2/
      * http://tab-2.3/   
      `))).toBe(true);

      // also expect only two tabs in fchrome
      await wait(2);
      expect(fchrome.fakeWindows[0].tabs!).toHaveLength(2);
    });

    test('showing hidden tab in visible window', () => {
      // TODO: write this
    });

    test('showing hidden tab in hidden window', () => {
      // TODO: write this
    });
  });
  describe('Hiding and Showing Windows', async () => {
    test('hiding unnamed window', () => {
      // TODO: write this
    });

    test('hiding named window', () => {
      // TODO: write this
    });

    test('showing hidden window', () => {
      // TODO: write this
    });
  });
});
