import 'react-testing-library/cleanup-after-each';

import {
  getWindowGroups,
  getWindowsVisibilities,
  getTabsVisibilities,
  getTabsInWindow,
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait } from '../_test-utils';
import { fireEvent } from 'react-testing-library';

describe('BananaTabs Tests: Text Mode', async () => {
  //
  test('NewWindowView', async () => {
    //
    // GIVEN an initially rendered app
    const windows = `
			window 1:
			* http://tab-1.1/
    `;
    const {
      container,
      getByText,
      getByTestId,
      getByRole,
      provider
    } = await renderBananaTabs(windows);
    await wait();

    // assert we have some window groups
    getByTestId('window-group');

    // WHEN clicking the add links button
    const button = getByText(/add links/i);
    fireEvent.click(button);
    await wait();

    // THEN the new window screen appears
    getByTestId('new-window-view');

    // WHEN typing in a list of links in the textarea
    fireEvent.change(getByRole('input'), {
      target: {
        value: `
    Typed In Window:
    * http://pasted-tab-1/
    * http://pasted-tab-2/
    * http://pasted-tab-3/
    `
      }
    });

    // AND clicking again on the add links button
    const okButton = getByText(/add links/i);
    fireEvent.click(okButton);
    await wait();
    
    // EXPECT the new window group to be in the bananatabs list
    getByText('Typed In Window');
    getByText('http://pasted-tab-1/');
    getByText('http://pasted-tab-2/');
    getByText('http://pasted-tab-3/');

    // also EXPECT the DOM elements to displat the window group with the hidden icon
    // and the tabs with the visible icon
    const windowGroups = getWindowGroups(container);
    expect(getWindowsVisibilities(windowGroups)).toMatchObject([
      true,
      false
    ]);
    expect(getTabsVisibilities(getTabsInWindow(windowGroups[1]))).toMatchObject([
      true,
      true,
      true
    ]);

    // EXPECT the session to be consistent with the above DOM elements
    expect(provider.session.windows).toHaveLength(2);
    expect(provider.session.windows[1].tabs).toHaveLength(3);
    expect(provider.session.windows[1].visible).toBe(false);

    await wait();
  });
});
