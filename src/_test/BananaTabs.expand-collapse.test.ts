import { fireEvent } from '@testing-library/react';
import '@testing-library/react/cleanup-after-each';

import {
  /*getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,*/
  renderBananaTabs,
} from '../_test-utils/bananatabs.utils';

import { wait } from '../_test-utils';

describe('BananaTabs Tests: Expand/Collapse Disclosure Button', async () => {
  //
  const initialise = async () => {
    return await renderBananaTabs(`
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

  test('Collapsing then Expanding a Window Group', async () => {
    //
    // given an initial rendered app
    const { getWindowDisclosureButton, isWindowExpanded } = await initialise();

    // EXPECT all windows to the expanded
    expect(isWindowExpanded(0)).toBe(true);
    expect(isWindowExpanded(1)).toBe(true);

    // WHEN the button to collapse w window group  is clicked
    fireEvent.click(getWindowDisclosureButton(0));
    await wait();

    // EXPECT the first window to be collapsed:
    expect(isWindowExpanded(0)).toBe(false);
    expect(isWindowExpanded(1)).toBe(true);

    // WHEN the button to collapse w window group  is clicked
    fireEvent.click(getWindowDisclosureButton(0));
    await wait();

    // EXPECT all windows to the expanded again
    expect(isWindowExpanded(0)).toBe(true);
    expect(isWindowExpanded(1)).toBe(true);

    await wait();
  });

  test('Hovering Window Title reveals tools', async () => {
    //
    // GIVEN an initial rendered app
    const { getWindowGroups } = await initialise();

    // WHEN hovering the first window title
    const windowGroup0 = getWindowGroups()[0];
    fireEvent.mouseEnter(windowGroup0);
    await wait();

    // EXPECT
  });

  test.skip('Hovering Tab Title reveals tools', async () => {
    //
  });

  test.skip('Clicking the delete button deletes a tab', async () => {
    //
  });

  test.skip('Clicking the delete button deletes a window group', async () => {
    //
  });
});
