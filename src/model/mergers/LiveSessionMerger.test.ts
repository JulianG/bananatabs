import { DefaultLiveSessionMerger } from './LiveSessionMerger';
import { stringToSession } from '../../serialisation/MarkdownSerialisation';

import * as BT from '../../model/CoreTypes';
import { compareSessions } from '../../utils/test-utils/session-compare-functions';

function mergeSessions(live: string, stored: string): { live: BT.Session; stored: BT.Session; merged: BT.Session } {
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

  test('when no windows visible. merged session is same as stored session', () => {
    testSessionsMatch('no-windows');
  });

  test('when no windows visible. after opening a new window.', () => {
    testSessionsMatch('new-tab');
  });

  test('when there is only one tab and it is empty. onTabsUpdated status:"complete".', () => {
    testSessionsMatch('on-tab-status-complete');
  });

  test('when closing or deleting a tab', () => {
    testSessionsMatch('on-tabs-removed');
  });

  test('when hiding a tab', () => {
    testSessionsMatch('when-hiding-tab');
  });

  test('when hiding a window', () => {
    testSessionsMatch('when-hiding-window');
  });

  test('when dragging a tab to a new window', () => {
    testSessionsMatch('when-dragging-tab-out');
  });

  test('when dropping a tab to an existing window', () => {
    testSessionsMatch('when-dropping-tab-in');
  });

  test('when reopening browser with no changes', () => {
    testSessionsMatch('restoring-session-no-changes');
  });

  test('when reopening browser after having added 1 tab to a window with 2 tabs', () => {
    testSessionsMatch('restoring-session-adding-1-to-2');
  });

  test('when reopening browser after having added 1 tab to a window with 4 tabs', () => {
    testSessionsMatch('restoring-session-adding-1-to-4');
  });

  ///

  function testSessionsMatch(name: string) {
    const { live, stored, expected } = getSessions(name);
    const merger = new DefaultLiveSessionMerger();
    const mergedSession = merger.merge(live, stored);
    try {
      expect(compareSessions(mergedSession, expected)).toBeTruthy();
    } catch (e) {
      console.error(e);
      // console.log(JSON.stringify(mergedSession));
      fail();
    }
  }

  const testingFiles = '../../utils/test-utils/session-merger-test-files/';

  function getSessions(name: string): { live: BT.Session; stored: BT.Session; expected: BT.Session } {
    const live: BT.Session = require(`${testingFiles}${name}/live-session.json`);
    const stored: BT.Session = require(`${testingFiles}${name}/stored-session.json`);
    const expected: BT.Session = require(`${testingFiles}${name}/expected-session.json`);
    return { live, stored, expected };
  }
});
