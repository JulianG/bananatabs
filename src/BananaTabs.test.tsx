import * as React from 'react';
import {
  render,
  queryAllByAttribute,
  queryByAltText
} from 'react-testing-library';
import { stringToSession } from './serialisation/MarkdownSerialisation';

import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';

describe('not sure', async () => {
  //
  test('some app test', async () => {
    //
    const live = `
window 1:
 * http://tab-1.1/
 * http://tab-1.2/
 * http://tab-1.3/

window 2:
 * http://tab-2.1/
 * http://tab-2.2/
    `;
    const stored = `
window 1:
 * http://tab-1.1/
 * http://tab-1.2/
 * http://tab-1.3/

window 2:
 * http://tab-2.1/
 * http://tab-2.2/
 ~ http://tab-2.3/  
    `;

    const { container } = render(
      <BananaTabs factory={getFactory(live, stored)} />
    );
    await wait();
    // const a = queryAllByAltText('tab-visible');
    const windowGroups = getWindowGroups(container);
    expect(windowGroups).toHaveLength(2);
    const [window1, window2] = windowGroups;

    expect(getTabsVisibilities(getTabsInWindow(window1))).toMatchObject([
      true,
      true,
      true
    ]);
    expect(getTabsVisibilities(getTabsInWindow(window2))).toMatchObject([
      true,
      true,
      false
    ]);
  });
});

function getFactory(live: string, stored: string) {
  const liveSession = stringToSession(live);
  const storedSession = stringToSession(stored);
  const fake = { live: liveSession, stored: storedSession };
  return new BananaFactory(fake);
}

function wait(d: number = 1) {
  return new Promise(resolve => {
    setTimeout(() => { resolve(); }, d);
  });
}

function getWindowGroups(container: HTMLElement) {
  return queryAllByAttribute('id', container, 'window-group');
}

function getTabsInWindow(windowGroup: HTMLElement) {
  return queryAllByAttribute('id', windowGroup, 'tab');
}

function getTabsVisibilities(tabs: HTMLElement[]): boolean[] {
  return tabs.map(t => {
    const visible = queryByAltText(t, 'tab-visible');
    // const hidden = queryByAltText(t, 'tab-hidden');
    return visible !== null;
  });
}
