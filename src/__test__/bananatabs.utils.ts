import {
  queryAllByAttribute,
  queryByAltText
} from 'react-testing-library';
import { stringToSession } from '../serialisation/MarkdownSerialisation';
import BananaFactory from '../factory/BananaFactory';

export function getFactory(live: string, stored: string) {
  const liveSession = stringToSession(live);
  const storedSession = stringToSession(stored);
  const fake = { live: liveSession, stored: storedSession };
  return new BananaFactory(fake);
}

export function wait(d: number = 1) {
  return new Promise(resolve => {
    setTimeout(() => { resolve(); }, d);
  });
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
