import { fireEvent /*, getByTestId, cleanup*/ } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import {
  /*getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,*/
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait } from '../_test-utils';

describe('BananaTabs Tests: Expand/Collapse Disclosure Button', async () => {
  //
  test('Collapsing then Expanding a Window Group', async () => {
    //
    // given an initial rendered app
    const {
      getWindowDisclosureButton,
      isWindowExpanded
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

    // EXPECT all windows to the expanded
    expect(isWindowExpanded(0)).toBe(true);
    expect(isWindowExpanded(1)).toBe(true);

    // WHEN the button to collapse w window group  is clicked
    fireEvent.click(getWindowDisclosureButton(0));

    // EXPECT the first window to be collapsed:
    expect(isWindowExpanded(0)).toBe(false);
    expect(isWindowExpanded(1)).toBe(true);

    // WHEN the button to collapse w window group  is clicked
    fireEvent.click(getWindowDisclosureButton(0));

    // EXPECT all windows to the expanded again
    expect(isWindowExpanded(0)).toBe(true);
    expect(isWindowExpanded(1)).toBe(true);

    await wait();
  });
});
