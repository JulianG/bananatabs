import * as BT from '../core/CoreTypes';
import { console as mconsole } from '../../utils/MutedConsole';

export function mergeSessions(
  stored: BT.Session,
  live: BT.Session
): BT.Session {
  mconsole.group('SessionMerger.mergeSessions');
  const mergedSessionWindows: BT.Window[] = [];
  const liveWindowsWithTabs = live.windows.filter(w => w.tabs.length > 0);
  stored.windows.forEach(storedWindow => {
    mconsole.group(
      'processing a stored window: ' +
        storedWindow.id +
        ' ' +
        storedWindow.title
    );

    mconsole.log('looking for a live matching window...');

    const liveMatchingWindow = liveWindowsWithTabs.find(liveWindow => {
      return (
        compareWindows(liveWindow, storedWindow) >= 0.5 &&
        shouldAddLiveWindow(liveWindow, live)
      );
    });
    if (liveMatchingWindow) {
      mconsole.log(
        'found liveMatchingWindow: ' +
          liveMatchingWindow.id +
          ' ' +
          liveMatchingWindow.title
      );
      mconsole.log('pushing live matching window: ');
      const pushingWindow = {
        ...liveMatchingWindow,
        visible: true,
        title: storedWindow.title,
        expanded: storedWindow.expanded,
        tabs: mergeTabs(liveMatchingWindow.tabs, storedWindow.tabs),
      };
      pushUniqueWindow(mergedSessionWindows, pushingWindow);
    } else {
      mconsole.log('could not find a live matching window');
      if (storedWindow.title !== '') {
        mconsole.log('pushing a hidden window: ');
        const pushingWindow = {
          ...storedWindow,
          focused: false,
          visible: false,
        };
        pushUniqueWindow(mergedSessionWindows, pushingWindow);
      } else {
        mconsole.log(
          'NOT pushing stored window because title was empty string.'
        );
      }
    }

    mconsole.groupEnd();
  });

  const nonMatchedWindows = liveWindowsWithTabs.filter(liveW => {
    return (
      shouldAddLiveWindow(liveW, live) &&
      !mergedSessionWindows.some(msW => msW.id === liveW.id)
    );
  });

  mconsole.group(
    `adding nonMatchedWindows... (${nonMatchedWindows.map(nmw => nmw.id)})`
  );
  const newSessionWindows = [...mergedSessionWindows, ...nonMatchedWindows];
  mconsole.table(nonMatchedWindows);
  mconsole.groupEnd();
  mconsole.groupEnd();
  return new BT.Session(newSessionWindows, live.panelWindow);
}

function mergeTabs(
  liveTabs: ReadonlyArray<BT.Tab>,
  storedTabs: ReadonlyArray<BT.Tab>
): ReadonlyArray<BT.Tab> {
  mconsole.log('storedTabs...');
  mconsole.table(storedTabs);
  mconsole.log('liveTabs...');
  mconsole.table(liveTabs);

  mconsole.log('extraLiveTabs... (tabs in liveTabs not present in storedTabs)');
  const extraLiveTabs = liveTabs.filter(liveTab => {
    return storedTabs.find(tab => tab.url === liveTab.url) === undefined;
  });
  mconsole.table(extraLiveTabs);

  mconsole.log(`filteredTabs... 
		(storedTabs which are either not visible or are visible AND have a liveTab with the same id)`);
  const filteredTabs: BT.Tab[] = storedTabs.filter((storedTab, i) => {
    return (
      storedTab.visible === false ||
      (storedTab.visible &&
        liveTabs.find(liveTab => liveTab.url === storedTab.url))
    );
  });
  mconsole.table(filteredTabs);

  mconsole.log(`mergedTabs... 
		(filteredTabs with extraLiveTabs inserted by index... hmmmm not accurate enough?)`);
  const mergedTabs = [...filteredTabs];
  extraLiveTabs.forEach(t => {
    mergedTabs.splice(t.index, 0, t);
  });
  mconsole.table(mergedTabs);

  mconsole.log(
    'mergedLiveTabs... mergedTabs fixed to get details from liveTabs where possible'
  );
  let highestLiveTabIndex = -1;
  const mergedLiveTabs = mergedTabs.map((tab, i) => {
    const liveTab = liveTabs.find(lt => lt.url === tab.url);
    highestLiveTabIndex = liveTab ? liveTab.index + 1 : highestLiveTabIndex;
    const newTab = { ...(liveTab || tab) };
    newTab.title = newTab.title || tab.title;
    newTab.icon = newTab.icon || tab.icon;
    newTab.index = liveTab ? newTab.index : highestLiveTabIndex;
    newTab.listIndex = i;
    return newTab as BT.Tab;
  });
  mconsole.table(mergedLiveTabs);

  let finalTabs = mergedLiveTabs.sort((ta, tb) => ta.index - tb.index);

  mconsole.log('finalTabs...');
  mconsole.table(finalTabs);

  if (
    finalTabs.length === 0 ||
    (finalTabs.length < liveTabs.length && finalTabs.length < storedTabs.length)
  ) {
    mconsole.error(`ERROR! merging tabs!
					live tabs   : ${liveTabs.length} vs. 
					stored tabs : ${storedTabs.length}
					final tabs  : ${finalTabs.length}`);
    mconsole.warn('Using stored tabs instead of live or merged tabs.');
    return storedTabs;
  }
  return uniqueTabsById(finalTabs);
}

function uniqueTabsById(tabs: BT.Tab[]): BT.Tab[] {
  const uniqueArray: BT.Tab[] = [];
  tabs.forEach(tab => {
    if (uniqueArray.some(t => t.id === tab.id) === false) uniqueArray.push(tab);
  });
  return uniqueArray;
}

function compareWindows(live: BT.Window, stored: BT.Window): number {
  if (live.id === stored.id) {
    return 1;
  }

  const liveTabURLs = live.tabs.map(t => t.url);
  const storedTabURLs = stored.tabs.filter(t => t.visible).map(t => t.url);

  const allURLs = [...liveTabURLs, ...storedTabURLs];
  const uniqueURLs = Array.from(new Set(allURLs));

  const intersection = uniqueURLs.filter(
    url => liveTabURLs.includes(url) && storedTabURLs.includes(url)
  );

  const similarity = intersection.length / uniqueURLs.length;
  return similarity;
}

function pushUniqueWindow(array: BT.Window[], window: BT.Window) {
  if (array.some(w => w.id === window.id) === false) {
    array.push(window);
  } else {
    mconsole.warn('duplicate window: ', window.id, window.title);
  }
}

function shouldAddLiveWindow(
  liveW: BT.Window,
  liveSession: BT.Session
): boolean {
  return (
    liveW.id !== liveSession.panelWindow.id &&
    liveW.tabs.every(t => t.url.indexOf('bananatabs-ignore') < 0)
  );
}
