import { fireEvent /*, getByTestId, cleanup*/ } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import {
  getWindowGroups,
  getTabsVisibilities,
  getTabsInWindow,
  renderBananaTabs
} from '../_test-utils/bananatabs.utils';

import { wait, compareSessions } from '../_test-utils';

import { stringToSession } from '../serialisation/MarkdownSerialisation';

describe('BananaTabs snapshot tests', async () => {
  test('basic ui markup', async () => {
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
    const { container, fchrome } = await renderBananaTabs(windows);
    await wait(1);

    // expect the rendered output to match the snapshot
    expect(container).toMatchSnapshot();
  });
});
