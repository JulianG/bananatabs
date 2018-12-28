// tslint:disable no-unused-variable
import * as React from 'react';
import { render, queryAllByAttribute, queryByAltText, getByTestId } from 'react-testing-library';
import { stringToSession } from '../serialisation/MarkdownSerialisation';
import FakePromisingChromeAPI from '../chrome-api/FakePromisingChromeAPI';
import BananaFactory from '../factory/BananaFactory';
import BananaTabs from '../BananaTabs';
import { wait } from '.';

export { wait };

// tslint:disable no-any
export async function renderBananaTabs(live: string, stored: string | null = null) {
  stored = stored !== null ? stored : live;
  const factory = getFactory(live, stored);
  const fchrome = factory.getChromeAPI() as FakePromisingChromeAPI;

  const { container, debug } = render(React.createElement(BananaTabs, { factory }));
  await wait();
  const provider = factory.getSessionProvider();

  return { container, debug, fchrome, provider, ...getFunctions(container) };
}

function getFunctions(container: HTMLElement) {
  return {
    getWindowGroups: () => {
      return getWindowGroups(container);
    },
    getTab: (windowIndex: number, tabIndex: number) => {
      return getTabsInWindow(getWindowGroups(container)[windowIndex])[tabIndex];
    },
    getTabVisibilityToggle: (windowIndex: number, tabIndex: number) => {
      const tab = getTabsInWindow(getWindowGroups(container)[windowIndex])[tabIndex];
      return getByTestId(tab, 'visibility-toggle');
    }
  };
}

export function getFactory(live: string, stored: string) {
  const liveSession = stringToSession(live);
  const storedSession = stringToSession(stored);
  const fake = { live: liveSession, stored: storedSession };
  return new BananaFactory(fake);
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
