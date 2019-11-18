import * as faker from 'faker';
import * as BT from '../model/core/CoreTypes';
import fromentries from 'fromentries';

export function parseSessionString(ss: string): BT.Session {
  let lastId = 1000;
  const windows = _parseSessionString(ss).map(w => {
    w.tabs = ensureOneActiveTab(
      w.tabs.map((t, i) => {
        const tab = Object.assign({}, t, { index: i, listIndex: i });
        return Object.assign(BT.getNewTab(), tab, {
          id: ++lastId,
          url: getRandomURL(),
          title: getRandomTitle()
        });
      })
    );
    return Object.assign(BT.getNewWindow(), w, { id: ++lastId });
  });

  if (windows.length < 1 && ss !== '') {
    throw new Error('Error! Invalid input string.');
  }
  return new BT.Session(windows, BT.getNewWindow());
}

function _parseSessionString(ss: string) {
  const windowsRegEx = /\[([^\]]+)\]/g;
  const windows = ss.match(windowsRegEx) || [];
  const validWindows = windows.map(parseWindowString).filter(s => s != null);
  return validWindows;
}

function parseWindowString(ws: string) {
  ws = ws.replace('[', '').replace(']', '');
  const tabsRegExp = /\(([^)]*)\)/g;
  const matchedTabs = ws.match(tabsRegExp);
  if (!matchedTabs || matchedTabs.length !== 1) {
    throw new Error('Error! Invalid input string.');
  }
  const windowDefinition = ws.replace(tabsRegExp, '');
  const tabsString = matchedTabs[0];
  const tabs = tabsString
    .replace('(', '')
    .replace(')', '')
    .split(',')
    .map(parseProps);
  return parseWindowDefinitionString(windowDefinition, tabs);
}

function parseWindowDefinitionString(wd: string, tabs: {}[]) {
  return { ...parseProps(wd), tabs };
}

function parseProps(sp: string): {} {
  const propList = (sp.match(/(!.)|(.)/g) || []).map(parseProp);
  return fromentries(propList);
}

function parseProp(p: string): [string, boolean | string] {
  const v: boolean = p[0] !== '!';
  const n: string = translatePropName(v ? p[0] : p[1]);

  switch (n) {
    case 'title':
      return [n, faker.hacker.phrase()];
    default:
      return [n, v];
  }
}

function translatePropName(n: string): string {
  const keys: Object = {
    v: 'visible',
    f: 'focused',
    a: 'active',
    t: 'title'
  };
  if (keys.hasOwnProperty(n)) {
    return keys[n];
  } else {
    throw `Error! Invalid input string. I don't know what to do with '${n}'.`;
  }
}

////

function ensureOneActiveTab(tabs: BT.Tab[]): BT.Tab[] {
  let visibleTabs = tabs.filter(t => t.visible);
  if (visibleTabs.length > 0) {
    const activeTab = visibleTabs.find(t => t.active) || visibleTabs[0];
    return tabs.map(t => {
      return { ...t, active: t.id === activeTab.id };
    });
  } else {
    return tabs;
  }
}

function getRandomURL(): string {
  return faker.internet.url();
}

function getRandomTitle(): string {
  return faker.lorem.sentence();
}
