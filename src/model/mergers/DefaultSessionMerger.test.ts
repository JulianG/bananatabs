import * as BT from '../core/CoreTypes';
import { mergeSessions } from './DefaultSessionMerger';
import { stringToSession } from '../../serialisation/MarkdownSerialisation';
import { compareSessions } from '../../_test-utils/session-compare-functions';

function mergeStringSessions(
  stored: string,
  live: string
): {
  live: BT.Session;
  stored: BT.Session;
  merged: BT.Session;
} {
  const liveSession = stringToSession(live);
  const storedSession = stringToSession(stored);
  const mergedSession = mergeSessions(storedSession, liveSession);
  return {
    live: liveSession,
    stored: storedSession,
    merged: mergedSession,
  };
}

describe('DefaultSessionMerger merge cases', () => {
  const cases = [
    {
      only: true,
      name: 'after turning on 1 tab in a hidden window',
      live: `
      :
      * http://tab-1.3/
      `,
      stored: `
      My Stored Window:
      ~ http://tab-1.1/
      ~ http://tab-1.2/
      * http://tab-1.3/
      
      Some Other Window:
      * http://tab-2.1/        
      `,
      expected: `
      My Stored Window:
      ~ http://tab-1.1/
      ~ http://tab-1.2/
      * http://tab-1.3/
      
      Some Other Window~
      * http://tab-2.1/        
      `,
    },
    {
      name: 'identical window groups',
      live: `
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/
    `,
      stored: `
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/
      `,
      expected: `
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
        * http://tab-1.3/
        `,
    },
    {
      name: 'similar window groups: 1 vs. 2 tabs',
      live: `
        :
        * http://tab-1.1/
    `,
      stored: `
        window 1:
        * http://tab-1.1/
        ~ http://tab-1.2/
      `,
      expected: `
        window 1:
        * http://tab-1.1/
        ~ http://tab-1.2/
        `,
    },
    {
      name:
        'tabs missing in live but visible in stored will be missing in merged,\
        because we assume they were intentionally closed',
      live: `
        :
        * http://tab-1.1/
    `,
      stored: `
        window 1:
        * http://tab-1.1/
        * http://tab-1.2/
      `,
      expected: `
        window 1:
        * http://tab-1.1/
        `,
    },
    {
      name: 'order of merged visible tabs should be as expected',
      live: `
        :
        * http://tab-2
        * http://tab-4
    `,
      stored: `
        Stored Visible Window (Should be Matched):
        ~ http://tab-1
        * http://tab-2
        ~ http://tab-3
        * http://tab-4
      `,
      expected: `
        Stored Visible Window (Should be Matched):
        ~ http://tab-1
        * http://tab-2
        ~ http://tab-3
        * http://tab-4
        `,
    },
    {
      name:
        'if enough tabs are the same, then the windows are matched properly',
      live: `
        :
        * http://tab-1.01/same
        * http://tab-1.02/same
        * http://tab-1.03/same
        * http://tab-1.04/same
        * http://tab-1.99/new
    `,
      stored: `
        window 1:
        * http://tab-1.01/same
        * http://tab-1.02/same
        * http://tab-1.03/same
        * http://tab-1.04/same
        ~ http://tab-1.xx/--old-off
        ~ http://tab-1.yy/--old-off
        * http://tab-1.uu/--old-on
      `,
      expected: `
        window 1:
        * http://tab-1.01/same
        * http://tab-1.02/same
        * http://tab-1.03/same
        * http://tab-1.04/same
        * http://tab-1.99/new
        ~ http://tab-1.xx/--old-off
        ~ http://tab-1.yy/--old-off
        `,
    },
    {
      name: 'some differences in tabs, but still the same window',
      live: `
        :
        * http://tab-1.01/same
        * http://tab-1.02/same
        * http://tab-1.99/new
    `,
      stored: `
        window 1:
        * http://tab-1.01/same
        * http://tab-1.02/same
        ~ http://tab-1.xx/--old-off
        ~ http://tab-1.yy/--old-off
        * http://tab-1.uu/--old-on
      `,
      expected: `
        window 1:
        * http://tab-1.01/same
        * http://tab-1.02/same
        * http://tab-1.99/new
        ~ http://tab-1.xx/--old-off
        ~ http://tab-1.yy/--old-off
     `,
    },
  ];

  cases.forEach((testCase) => {
    const { name, stored, live, expected } = testCase;
    test(name, () => {
      const { merged } = mergeStringSessions(stored, live);
      expect(compareSessions(merged, stringToSession(expected))).toBe(true);
    });
  });
});

describe('DefaultSessionMerger tab order', () => {
  test('order of merged visible tabs should be as expected', () => {
    const { merged } = mergeStringSessions(
      `Stored Visible Window (Should be Matched):
      ~ http://tab-1
      * http://tab-2
      ~ http://tab-3
      * http://tab-4
      `,
      `:
      * http://tab-2
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
});

describe('DefaultSessionMerger remove duplicate tabs', () => {
  test('merged tabs should neve contain duplicates', () => {
    const storedSession: BT.Mutable<BT.Session> = stringToSession(`:
    * http://tab-1
    * http://tab-1
    * http://tab-2
    `);
    const liveSession: BT.Mutable<BT.Session> = stringToSession(`:
    * http://tab-1
    * http://tab-2
    `);

    ((storedSession.windows[0].tabs as BT.Mutable<BT.Tab[]>)[0]
      .id as BT.Mutable<number>) = 99999;
    ((storedSession.windows[0].tabs as BT.Mutable<BT.Tab[]>)[1]
      .id as BT.Mutable<number>) = 99999;
    ((liveSession.windows[0].tabs as BT.Mutable<BT.Tab[]>)[0].id as BT.Mutable<
      number
    >) = 99999;

    const merged = mergeSessions(storedSession, liveSession);

    expect(merged.windows.length).toBe(1);
    expect(merged.windows[0].tabs.map((t) => t.url)).toMatchObject([
      'http://tab-1',
      'http://tab-2',
    ]);
  });
});
