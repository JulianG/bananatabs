import { initialiseFakeChromeAPI } from './initialise-fake-chrome-api';
import { parseSessionString } from './session-string-parser';

import '../_test-utils/expect-extend-functions';

describe('testing the tests utils: fake chrome initialiser', async () => {
  test('fchrome is initialised with the correct number of windows and tabs', async () => {
    // given a session string
    const ss = '[vf(v,!v,va)],[!v(av)]';
    const session = parseSessionString(ss);

    // when fchrome is initialised
    const fchrome = initialiseFakeChromeAPI(session);
    const fchws = await fchrome.windows.getAll({});

    // expect the fchrome to contain the same number of visible windows and tabs as the session
    const sessionVisibleWindows = session.windows.filter((w) => w.visible);
    expect(fchws).toHaveLength(sessionVisibleWindows.length);

    const visibleTabs = sessionVisibleWindows[0].tabs.filter((t) => t.visible);

    expect(fchws[0].tabs!).toHaveLength(visibleTabs.length);

    const expectedURLs = visibleTabs.map((t) => t.url);
    const actualURLs = fchws[0].tabs!.map((t) => t.url);
    expect(actualURLs).toMatchObject(expectedURLs);
  });

  test('fchrome is initialised with the correct focused window', async () => {
    // given a session string
    const ss = '[vf(v,!v,va)],[!v(av)]';
    const session = parseSessionString(ss);

    // when fchrome is initialised
    const fchrome = initialiseFakeChromeAPI(session);
    const fchws = await fchrome.windows.getAll({});

    // expect the correct window to be focused
    const focusedFakeWindows = fchws.filter((w) => w.focused);
    expect(focusedFakeWindows).toHaveLength(1);
    expect(fchws.find((w) => w.focused)!).toBeEquivalentToBTWindow(
      session.windows.find((w) => w.focused)!
    );
  });

  test('fchrome is initialised with the correct active tab on each window', async () => {
    // given a session string
    const ss = '[vf(v,va,v)]';
    const session = parseSessionString(ss);

    // when fchrome is initialised
    const fchrome = initialiseFakeChromeAPI(session);
    const fchws = await fchrome.windows.getAll({});

    // expect the fchrome to contain the same number of visible windows and tabs as the session
    const sessionVisibleWindows = session.windows.filter((w) => w.visible);
    expect(fchws).toHaveLength(sessionVisibleWindows.length);

    const visibleTabs = sessionVisibleWindows[0].tabs.filter((t) => t.visible);
    expect(fchws[0].tabs!).toHaveLength(visibleTabs.length);

    expect(fchws[0].tabs![0].active).toBe(visibleTabs[0].active);
    expect(fchws[0].tabs![1].active).toBe(visibleTabs[1].active);
    expect(fchws[0].tabs![2].active).toBe(visibleTabs[2].active);
  });
});
