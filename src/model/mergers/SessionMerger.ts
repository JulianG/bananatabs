import * as BT from '../core/CoreTypes';

import { console } from '../../utils/MutedConsole';

export interface SessionMerger {
  merge(live: BT.Session, stored: BT.Session): BT.Session;
}

export class DefaultSessionMerger implements SessionMerger {
  merge(live: BT.Session, stored: BT.Session): BT.Session {
    console.group('SessionMerger.mergeSessions');
    const mergedSessionWindows: BT.Window[] = [];
    const liveWindowsWithTabs = live.windows.filter(w => w.tabs.length > 0);
    stored.windows.forEach(storedWindow => {
      console.group(
        'processing a stored window: ' +
          storedWindow.id +
          ' ' +
          storedWindow.title
      );

      console.log('looking for a live matching window...');

      const liveMatchingWindow = liveWindowsWithTabs.find(liveWindow => {
        return (
          this.compareWindows(liveWindow, storedWindow) >= 0.75 &&
          this.shouldAddLiveWindow(liveWindow, live)
        );
      });
      if (liveMatchingWindow) {
        console.log(
          'found liveMatchingWindow: ' +
            liveMatchingWindow.id +
            ' ' +
            liveMatchingWindow.title
        );
        console.log('pushing live matching window: ');
        const pushingWindow = {
          ...liveMatchingWindow,
          visible: true,
          title: storedWindow.title,
          expanded: storedWindow.expanded,
          tabs: this.mergeTabs(liveMatchingWindow.tabs, storedWindow.tabs)
        };
        this.pushUniqueWindow(mergedSessionWindows, pushingWindow);
      } else {
        console.log('could not find a live matching window');
        if (storedWindow.title !== '') {
          console.log('pushing a hidden window: ');
          const pushingWindow = {
            ...storedWindow,
            focused: false,
            visible: false
          };
          this.pushUniqueWindow(mergedSessionWindows, pushingWindow);
        } else {
          console.log(
            'NOT pushing stored window because title was empty string.'
          );
        }
      }

      console.groupEnd();
    });

    const nonMatchedWindows = liveWindowsWithTabs.filter(liveW => {
      return (
        this.shouldAddLiveWindow(liveW, live) &&
        !mergedSessionWindows.some(msW => msW.id === liveW.id)
      );
    });

    console.group(
      `adding nonMatchedWindows... (${nonMatchedWindows.map(nmw => nmw.id)})`
    );
    const newSessionWindows = [...mergedSessionWindows, ...nonMatchedWindows];
    console.table(nonMatchedWindows);
    console.groupEnd();
    console.groupEnd();
    return new BT.Session(newSessionWindows, live.panelWindow);
  }

  private mergeTabs(
    liveTabs: ReadonlyArray<BT.Tab>,
    storedTabs: ReadonlyArray<BT.Tab>
  ): ReadonlyArray<BT.Tab> {
    console.log('storedTabs...');
    console.table(storedTabs);
    console.log('liveTabs...');
    console.table(liveTabs);

    console.log(
      'extraLiveTabs... (tabs in liveTabs not present in storedTabs)'
    );
    const extraLiveTabs = liveTabs.filter(liveTab => {
      return storedTabs.find(tab => tab.url === liveTab.url) === undefined;
    });
    console.table(extraLiveTabs);

    console.log(`filteredTabs... 
		(storedTabs which are either not visible or are visible AND have a liveTab with the same id)`);
    const filteredTabs: BT.Tab[] = storedTabs.filter((storedTab, i) => {
      return (
        storedTab.visible === false ||
        (storedTab.visible &&
          liveTabs.find(liveTab => liveTab.url === storedTab.url))
      );
    });
    console.table(filteredTabs);

    console.log(`mergedTabs... 
		(filteredTabs with extraLiveTabs inserted by index... hmmmm not accurate enough?)`);
    const mergedTabs = [...filteredTabs];
    extraLiveTabs.forEach(t => {
      mergedTabs.splice(t.index, 0, t);
    });
    console.table(mergedTabs);

    console.log(
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
      return newTab;
    });
    console.table(mergedLiveTabs);

    let finalTabs = mergedLiveTabs.sort((ta, tb) => ta.index - tb.index);

    console.log('finalTabs...');
    console.table(finalTabs);

    if (
      finalTabs.length === 0 ||
      (finalTabs.length < liveTabs.length &&
        finalTabs.length < storedTabs.length)
    ) {
      console.error(`ERROR! merging tabs!
					live tabs   : ${liveTabs.length} vs. 
					stored tabs : ${storedTabs.length}
					final tabs  : ${finalTabs.length}`);
      console.warn('Using stored tabs instead of live or merged tabs.');
      return storedTabs;
    }
    return finalTabs;
  }

  private compareWindows(live: BT.Window, stored: BT.Window): number {
    if (live.id === stored.id) {
      return 1;
    }
    const liveURLs = live.tabs.map(tab => tab.url).sort();
    const storedURLs = stored.tabs.map(tab => tab.url).sort();
    const matchesInLive = liveURLs.filter(
      liveURL => storedURLs.indexOf(liveURL) >= 0
    ).length;
    const matchesInStored = storedURLs.filter(
      storedURL => liveURLs.indexOf(storedURL) >= 0
    ).length;
    const similarity = () =>
      ((matchesInLive / liveURLs.length) * matchesInStored) / storedURLs.length;
    return liveURLs.length === matchesInLive ? 0.99 : similarity();
  }

  private pushUniqueWindow(array: BT.Window[], window: BT.Window) {
    if (array.some(w => w.id === window.id) === false) {
      array.push(window);
    } else {
      console.warn('duplicate window: ', window.id, window.title);
    }
  }

  private shouldAddLiveWindow(
    liveW: BT.Window,
    liveSession: BT.Session
  ): boolean {
    return (
      liveW.id !== liveSession.panelWindow.id &&
      liveW.tabs.every(t => t.url.indexOf('bananatabs-ignore') < 0)
    );
  }
}
