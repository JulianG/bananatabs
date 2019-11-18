import '@testing-library/react/cleanup-after-each';

import {
  getWindowGroups,
  getWindowsVisibilities,
  getTabsVisibilities,
  getTabsInWindow,
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait } from '../_test-utils';
import { fireEvent } from '@testing-library/react';

describe('BananaTabs Tests: Text Mode', async () => {
  //

  const trimLines = (text: string) =>
    text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

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
      getAllByTestId,
      getByRole,
      provider
    } = await renderBananaTabs(windows);
    await wait();

    // assert we have some window groups
    getAllByTestId('window-group');

    // WHEN clicking the add links button
    const button = getByText(/add links/i);
    fireEvent.click(button);
    await wait();

    // THEN the new window screen appears
    getAllByTestId('new-window-view');

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
    expect(getWindowsVisibilities(windowGroups)).toMatchObject([true, false]);
    expect(getTabsVisibilities(getTabsInWindow(windowGroups[1]))).toMatchObject(
      [true, true, true]
    );

    // EXPECT the session to be consistent with the above DOM elements
    expect(provider.session.windows).toHaveLength(2);
    expect(provider.session.windows[1].tabs).toHaveLength(3);
    expect(provider.session.windows[1].visible).toBe(false);

    await wait();
  });

  test('TextWindowView - sharing all windows', async () => {
    //
    // GIVEN an initially rendered app with some hidden tabs and windows
    const windows = `
			window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      
      window 2~
      ~ http://tab-2.1/
      * http://tab-2.2/
    `;
    const { getByText, getAllByTestId, getByRole } = await renderBananaTabs(
      windows
    );
    await wait();

    // assert we have some window groups
    getAllByTestId('window-group');

    // WHEN clicking the share all windows button
    fireEvent.click(getByText(/share all windows/i));
    await wait();

    // THEN the text window screen appears
    getAllByTestId('text-window-view');

    const input = getByRole('input') as HTMLTextAreaElement;

    // EXPECT the content of the input/textarea to match the initial session
    // but ignoringthe visibility of each window and tab. they should all look "visible"
    expect(trimLines(input.textContent!)).toBe(
      trimLines(`
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
        
        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
      `)
    );
    await wait();

    // WHEN clicking the "go back" button
    fireEvent.click(getByText(/go back/i));
    await wait();
    
    // EXPECT we have some window groups
    getAllByTestId('window-group');

  });

  test('TextWindowView - sharing one window', async () => {
    //
    // GIVEN an initially rendered app with some hidden tabs and windows
    const windows = `
			window 1:
      * http://tab-1.1/
      * http://tab-1.2/
      
      window 2~
      ~ http://tab-2.1/
      * http://tab-2.2/
    `;
    const { getByText, getAllByTestId, getByRole, getAllByAltText } = await renderBananaTabs(
      windows
    );
    await wait();

    // assert we have some window groups
    getAllByTestId('window-group');

    // WHEN clicking the share button on in
    fireEvent.click(getAllByAltText(/share/i)[1]);
    await wait();

    // THEN the text window screen appears
    getAllByTestId('text-window-view');

    const input = getByRole('input') as HTMLTextAreaElement;

    // EXPECT the content of the input/textarea to match the selected window group
    // but ignoringthe visibility of each window and tab. they should all look "visible"
    expect(trimLines(input.textContent!)).toBe(
      trimLines(`
        window 2:
        * http://tab-2.1/
        * http://tab-2.2/
      `)
    );
    await wait();

    // WHEN clicking the "go back" button
    fireEvent.click(getByText(/go back/i));
    await wait();
    
    // EXPECT we have some window groups
    getAllByTestId('window-group');

  });
});
