import { DefaultLiveSessionMerger } from './LiveSessionMerger';
import { stringToSession } from '../../serialisation/MarkdownSerialisation';

import * as BT from '../../model/CoreTypes';
// import { compareSessions } from '../../_test-utils/';

function mergeSessions(
  live: string,
  stored: string
): { live: BT.Session; stored: BT.Session; merged: BT.Session } {
  const liveSession = stringToSession(live);
  const storedSession = stringToSession(stored);
  const merger = new DefaultLiveSessionMerger();
  const mergedSession = merger.merge(liveSession, storedSession);
  return { live: liveSession, stored: storedSession, merged: mergedSession };
}

describe('LiveSessionMerger', () => {
  test('merging identical window groups', () => {
    // given identical live an stored sessions (with different ids)
    const { stored, merged } = mergeSessions(
      `
		window 1:
		 * http://tab-1.1/
		 * http://tab-1.2/
		 * http://tab-1.3/
			`,
      `
		window 1:
			* http://tab-1.1/
			* http://tab-1.2/
			* http://tab-1.3/  
			`
    );

    // when merged

    // expect
    expect(merged.windows).toHaveLength(stored.windows.length);
    expect(merged.windows[0].tabs).toHaveLength(stored.windows[0].tabs.length);
  });

  test('merging similar window groups: 1 vs. 2 tabs', () => {
    // given a live session with 1 tab
    // and a stored session with 2 tabs:
    // one matching and the other hidden.
    const { stored, merged } = mergeSessions(
      `
		window 1:
		* http://tab-1.1/
				`,
      `
		window 1:
		* http://tab-1.1/
		~ http://tab-1.3/  
			`
    );

    // when merging

    // expect 1 window in the merged session (the windows to have been matched)
    const mws = merged.windows;
    expect(mws).toHaveLength(1);

    // also expect 2 tabs, the second one being hidden
    expect(mws[0].tabs).toHaveLength(stored.windows[0].tabs.length);
    expect(mws[0].tabs[0].visible).toBeTruthy();
    expect(mws[0].tabs[1].visible).toBeFalsy();
  });
});

test('order of merged visible tabs should be as expected', () => {
  const { merged } = mergeSessions(
    `:
    * http://tab-2
    * http://tab-4
    `,
    `Stored Visible Window (Should be Matched):
    ~ http://tab-1
    * http://tab-2
    ~ http://tab-3
    * http://tab-4
    `
  );

  expect(merged.windows[0].tabs[0].url).toBe('http://tab-1');
  expect(merged.windows[0].tabs[0].visible).toBe(false);
  expect(merged.windows[0].tabs[1].url).toBe('http://tab-2');
  expect(merged.windows[0].tabs[1].visible).toBe(true);
  expect(merged.windows[0].tabs[2].url).toBe('http://tab-3');
  expect(merged.windows[0].tabs[2].visible).toBe(false);
  expect(merged.windows[0].tabs[3].url).toBe('http://tab-4');
  expect(merged.windows[0].tabs[3].visible).toBe(true);

});

// TODO: express merging tests with session strings like the ones above, but also the expected session, maybe?
