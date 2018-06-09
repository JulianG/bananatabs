import * as BT from '../CoreTypes';

import console from '../../utils/MutedConsole';

export default interface LiveSessionMerger {
	mergeLiveAndStored(live: BT.Session, stored: BT.Session): BT.Session;
	mergeManualAndStored(manual: BT.Window[], stored: BT.Window[]): BT.Window[];
}

export class DefaultLiveSessionMerger implements LiveSessionMerger {

	mergeManualAndStored(manual: BT.Window[], stored: BT.Window[]): BT.Window[] {

		const mergedWindows: BT.Window[] = [];
	
		manual.forEach(mw => {
			const matchedWindow = stored.find(sw => {
				const comp = this.compareManualAndStoredWindows(mw, sw);
				return comp > 0.75;
			});
			if (matchedWindow) {
				const tabs = this.mergeManualAndStoredTabs(mw.tabs, matchedWindow.tabs);
				mergedWindows.push({ ...matchedWindow, tabs });
			} else {
				mergedWindows.push({ ...mw });
			}
		});
		return mergedWindows;
	}

	mergeLiveAndStored(live: BT.Session, stored: BT.Session): BT.Session {

		console.group('SessionMerger.mergeSessions');

		const mergedSessionWindows: BT.Window[] = [];

		stored.windows.forEach(storedWindow => {

			console.group('processing a stored window: ' + storedWindow.id + ' ' + storedWindow.title);

			console.log('looking for a live matching window...');

			const liveMatchingWindow = live.windows.find(liveWindow => {
				return this.compareWindows(liveWindow, storedWindow) > 0.75 &&
					this.shouldAddLiveWindow(liveWindow, live);
			});
			if (liveMatchingWindow) {
				console.log('found liveMatchingWindow: ' + liveMatchingWindow.id + ' ' + liveMatchingWindow.title);
				liveMatchingWindow.title = storedWindow.title;
				liveMatchingWindow.expanded = storedWindow.expanded;
				liveMatchingWindow.tabs = this.mergeTabs(liveMatchingWindow.tabs, storedWindow.tabs);
				liveMatchingWindow.visible = true;
				console.log('pushing live matching window: ' + liveMatchingWindow.id + ' ' + liveMatchingWindow.title);
				this.pushUniqueWindow(mergedSessionWindows, liveMatchingWindow);

			} else {
				console.log('could not find a live matching window');

				if (storedWindow.title !== '') {
					console.log('pushing a hidden window: ' + storedWindow.id + ' ' + storedWindow.title);
					storedWindow.focused = false;
					storedWindow.visible = false;
					this.pushUniqueWindow(mergedSessionWindows, storedWindow);
				} else {
					console.log('NOT pushing stored window because title was empty string.');
				}
			}

			console.groupEnd();
		});

		const nonMatchedWindows = live.windows.filter(liveW => {
			return this.shouldAddLiveWindow(liveW, live) && !mergedSessionWindows.some(msW => msW.id === liveW.id);
		});

		console.group('adding nonMatchedWindows...');
		const newSessionWindows = [...mergedSessionWindows, ...nonMatchedWindows];
		console.table(nonMatchedWindows);
		console.groupEnd();

		console.groupEnd();

		return {
			windows: newSessionWindows,
			panelWindow: live.panelWindow
		};
	}

	private mergeTabs(liveTabs: BT.Tab[], storedTabs: BT.Tab[]): BT.Tab[] {

		console.groupCollapsed('mergeTabs:');
		console.log('storedTabs...');
		console.table(storedTabs);
		console.log('liveTabs...');
		console.table(liveTabs);

		console.log('extraLiveTabs... (tabs in liveTabs not present in storedTabs)');
		const extraLiveTabs = liveTabs.filter(liveTab => {
			return (storedTabs.find(storedTab => storedTab.id === liveTab.id) === undefined);
		});
		console.table(extraLiveTabs);

		console.log(`filteredTabs... 
		(storedTabs which are either not visible or are visible AND have a liveTab with the same id)`);
		const filteredTabs: BT.Tab[] = storedTabs.filter((storedTab, i) => {
			return storedTab.visible === false ||
				storedTab.visible && liveTabs.find(liveTab => liveTab.id === storedTab.id);
		});
		console.table(filteredTabs);

		console.log(`mergedTabs... 
		(filteredTabs with extraLiveTabs inserted by index... hmmmm not accurate enough?)`);
		const mergedTabs = [...filteredTabs];
		extraLiveTabs.forEach(t => {
			mergedTabs.splice(t.index, 0, t);
		});
		console.table(mergedTabs);

		console.log('mergedLiveTabs... mergedTabs fixed to get details from liveTabs where possible');
		let highestLiveTabIndex = -1;
		const mergedLiveTabs = mergedTabs.map((tab, i) => {
			const liveTab = liveTabs.find(lt => lt.id === tab.id);
			highestLiveTabIndex = liveTab ? liveTab.index + 1 : highestLiveTabIndex;
			const newTab = { ...(liveTab || tab) };
			newTab.title = newTab.title || tab.title;
			newTab.icon = newTab.icon || tab.icon;
			newTab.index = liveTab ? newTab.index : highestLiveTabIndex;
			newTab.listIndex = i;
			return newTab;
		});
		console.table(mergedLiveTabs);

		const sortedTabs = mergedLiveTabs.sort((ta, tb) => ta.index - tb.index);

		console.log('sortedTabs...');
		console.table(sortedTabs);
		console.groupEnd();
		return sortedTabs;

	}

	private compareWindows(live: BT.Window, stored: BT.Window): number {
		const liveURLs = live.tabs.map(tab => tab.url).sort();
		const storedURLs = stored.tabs.map(tab => tab.url).sort();
		const matchesInLive = liveURLs.filter(liveURL => storedURLs.indexOf(liveURL) >= 0).length;
		const matchesInStored = storedURLs.filter(storedURL => liveURLs.indexOf(storedURL) >= 0).length;
		return (live.id === stored.id) ? 1 : (matchesInLive / liveURLs.length * matchesInStored / storedURLs.length);
	}

	private pushUniqueWindow(array: BT.Window[], window: BT.Window) {
		if (array.some(w => w.id === window.id) === false) {
			array.push(window);
		} else {
			console.warn('duplicate window: ', window.id, window.title);
		}
	}

	private shouldAddLiveWindow(liveW: BT.Window, liveSession: BT.Session): boolean {
		return liveW.id !== liveSession.panelWindow.id &&
			liveW.tabs.every(t => t.url.indexOf('bananatabs-ignore') < 0);
	}

	////

	private mergeManualAndStoredTabs(manualTabs: BT.Tab[], storedTabs: BT.Tab[]): BT.Tab[] {
		const tabs: BT.Tab[] = [];

		manualTabs.forEach((mt) => {

			const matchingTab = storedTabs.find(t => t.url === mt.url);
			if (matchingTab) {
				tabs.push({ ...matchingTab });
			} else {
				tabs.push({ ...mt, title: mt.url });
			}
		});
		return tabs;
	}

	private compareManualAndStoredWindows(manual: BT.Window, stored: BT.Window): number {
		const liveURLs = manual.tabs.map(tab => tab.url).sort();
		const storedURLs = stored.tabs.map(tab => tab.url).sort();
		const matchesInLive = liveURLs.filter(liveURL => storedURLs.indexOf(liveURL) >= 0).length;
		const matchesInStored = storedURLs.filter(storedURL => liveURLs.indexOf(storedURL) >= 0).length;
		return (manual.title === stored.title) ? 1 : (matchesInLive / liveURLs.length * matchesInStored / storedURLs.length);
	}

}