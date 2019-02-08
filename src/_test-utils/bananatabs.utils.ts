// tslint:disable no-unused-variable
import * as React from 'react';
import {
  render,
  queryAllByAttribute,
  queryByAltText,
  getByTestId
} from 'react-testing-library';
import { stringToSession } from '../serialisation/MarkdownSerialisation';
import { FakePromisingChromeAPI } from '../chrome-api/FakePromisingChromeAPI';
import { createFakeBananaContext } from '../context/BananaContext';
import { BananaTabs } from '../BananaTabs';
import { wait } from '.';

export { wait };

export async function renderBananaTabs(
  live: string,
  stored: string | null = null
) {
  stored = stored !== null ? stored : live;
  const context = getBananaContext(live, stored);
  const fchrome = context.chromeAPI as FakePromisingChromeAPI;

  const { container, ...renderResult } = render(
    React.createElement(BananaTabs, { context: context })
  );
  await wait();
  const provider = context.sessionProvider;

  return {
    container,
    fchrome,
    provider,
    ...renderResult,
    ...createFunctions(container)
  };
}

function createFunctions(container: HTMLElement) {
  return {
    getWindowGroups: () => {
      return getWindowGroups(container);
    },
    getTab: (windowIndex: number, tabIndex: number) => {
      return getTabsInWindow(getWindowGroups(container)[windowIndex])[tabIndex];
    },
    getTabVisibilityToggle: (windowIndex: number, tabIndex: number) => {
      const tab = getTabsInWindow(getWindowGroups(container)[windowIndex])[
        tabIndex
      ];
      return getByTestId(tab, 'visibility-toggle');
    },
    getWindowVisibilityToggle: (windowIndex: number) => {
      const win = getWindowGroups(container)[windowIndex];
      return getByTestId(win, 'visibility-toggle');
    },
    getWindowDisclosureButton: (windowIndex: number) => {
      const win = getWindowGroups(container)[windowIndex];
      const expanded = queryByAltText(win, 'window-disclosure-expanded');
      const collapsed = queryByAltText(win, 'window-disclosure-collapsed');
      if (!expanded && !collapsed) {
        throw new Error(
          'Could not find alt="window-disclosure-expanded" nor alt="window-disclosure-collapsed"'
        );
      }
      return expanded || collapsed!;
    },
    isWindowExpanded: (windowIndex: number) => {
      const win = getWindowGroups(container)[windowIndex];
      const expanded = queryByAltText(win, 'window-disclosure-expanded');
      const collapsed = queryByAltText(win, 'window-disclosure-collapsed');
      if (!expanded && !collapsed) {
        throw new Error(
          'Could not find alt="window-disclosure-expanded" nor alt="window-disclosure-collapsed"'
        );
      }
      return !!expanded;
    }
  };
}

function getBananaContext(live: string, stored: string) {
  const liveSession = stringToSession(live);
  const storedSession = stringToSession(stored);
  const fake = { live: liveSession, stored: storedSession };
  return createFakeBananaContext(fake);
}

export function getWindowGroups(container: HTMLElement) {
  return queryAllByAttribute('id', container, 'window-group');
}

export function getTabsInWindow(windowGroup: HTMLElement) {
  return queryAllByAttribute('id', windowGroup, 'tab');
}

export function getTabsVisibilities(tabs: HTMLElement[]): boolean[] {
  return tabs.map(t => {
    const visible = queryByAltText(t, 'tab-visible');
    // const hidden = queryByAltText(t, 'tab-hidden');
    return visible !== null;
  });
}

export function getWindowsVisibilities(windows: HTMLElement[]): boolean[] {
  return windows.map(w => {
    const visible = queryByAltText(w, 'win-visible');
    return visible !== null;
  });
}
