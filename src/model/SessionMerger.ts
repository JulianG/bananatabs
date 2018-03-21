import * as BT from './CoreTypes';

const VERBOSE: boolean = false;

/* tslint:disable no-any */
const consoleLog = (message?: any, ...rest: any[]) => {
	if (VERBOSE) {
		console.log(message, ...rest);
	}
};

export default class SessionMerger {

	mergeSessions(live: BT.Session, stored: BT.Session): BT.Session {

		if (VERBOSE) {
			console.group('SessionMerger.mergeSessions');
		}

		const mergedSessionWindows: BT.Window[] = [];

		stored.windows.forEach((storedWindow, storedWindowIndex) => {

			if (VERBOSE) {
				console.group('storedWindow: ' + storedWindowIndex);
			}

			consoleLog('processing stored window:', storedWindow.title, storedWindow.id);

			if (storedWindow.visible === false) {

				if (storedWindow.title !== '') {
					consoleLog('  pushing a hidden window: ' + storedWindow.title);
					storedWindow.focused = false;
					this.pushUniqueWindow(mergedSessionWindows, storedWindow);
				}
			} else {
				consoleLog('  window ' + storedWindow.id + ' ' + storedWindow.title + ' is visible...');
				consoleLog('  looking for a live matching window...');

				const liveMatchingWindow = live.windows.find(liveWindow => this.compareWindows(liveWindow, storedWindow) > 0.75);
				if (liveMatchingWindow) {
					consoleLog('  found liveMatchingWindow: ' + liveMatchingWindow.id + ' ' + liveMatchingWindow.title);
					liveMatchingWindow.title = storedWindow.title;
					liveMatchingWindow.expanded = storedWindow.expanded;
					liveMatchingWindow.tabs = this.mergeTabs(liveMatchingWindow.tabs, storedWindow.tabs);
					consoleLog('  pushing live matching window: ' + liveMatchingWindow.title);
					this.pushUniqueWindow(mergedSessionWindows, liveMatchingWindow);

				} else {
					consoleLog('  could not find a live matching window');

					if (storedWindow.title !== '') {
						consoleLog('  pushing a hidden window: ' + storedWindow.title);
						storedWindow.focused = false;
						storedWindow.visible = false;
						this.pushUniqueWindow(mergedSessionWindows, storedWindow);
					}
				}
			}

			if (VERBOSE) {
				console.groupEnd();
			}
		});

		const nonMatchedWindows = live.windows.filter(liveWindow => {
			return !mergedSessionWindows.some(sessionWindow => sessionWindow.id === liveWindow.id);
		});
		const newSessionWindows = [...mergedSessionWindows, ...nonMatchedWindows];

		const extensionWindow = this.findExtensionWindow(newSessionWindows);
		const filteredWindows = newSessionWindows.filter(w => w !== extensionWindow);
		const panelGeometry: BT.Geometry = extensionWindow ?
			extensionWindow.geometry
			: { top: 0, left: 0, width: 0, height: 0 };

		consoleLog('panelGeometry', panelGeometry);

		if (VERBOSE) {
			console.groupEnd();
		}

		return { windows: filteredWindows, panelGeometry };
	}

	private mergeTabs(liveTabs: BT.Tab[], storedTabs: BT.Tab[]): BT.Tab[] {

		const mergedTabs: BT.Tab[] = storedTabs.filter((storedTab, i) => {
			return storedTab.visible === false ||
				storedTab.visible && liveTabs.find(liveTab => liveTab.id === storedTab.id);
		});

		const extraLiveTabs = liveTabs.filter(liveTab => {
			return (storedTabs.find(storedTab => storedTab.id === liveTab.id) === undefined);
		});

		extraLiveTabs.forEach(t => {
			mergedTabs.splice(t.index, 0, t);
		});

		const mergedLiveTabs = mergedTabs.map(tab => {
			const liveTab = liveTabs.find(lt => lt.id === tab.id);
			return liveTab || tab;
		});

		const sortedTabs = mergedLiveTabs.sort((a, b) => a.index - b.index);

		console.table(sortedTabs);

		return sortedTabs;

	}

	// private insertIntoLiveTabs(tabs: BT.Tab[], index: number, tab: BT.Tab): BT.Tab[] {
	// 	// const visibleTabsAfterIndex = tabs.slice(index).filter(t => t.visible);
	// 	tabs.splice(index, 0, tab);
	// 	// visibleTabsAfterIndex.forEach(t => t.index += 1);
	// 	return tabs;
	// }

	// private findTabIndex(list: BT.Tab[], tab: BT.Tab): number {
	// 	return this.findTabIndexById(list, tab) || this.findTabIndexByURL(list, tab);
	// }

	// private findTabIndexById(list: BT.Tab[], tab: BT.Tab): number {
	// 	return list.findIndex(t => t.id === tab.id);
	// }

	// private findTabIndexByURL(list: BT.Tab[], tab: BT.Tab): number {
	// 	return list.findIndex(t => t.url === tab.url);
	// }

	private compareWindows(live: BT.Window, stored: BT.Window): number {
		// const liveURLs = live.tabs.map(tab => tab.url).sort();
		// const storedURLs = live.tabs.map(tab => tab.url).sort();
		// const matchesInLive = liveURLs.filter(liveURL => storedURLs.indexOf(liveURL) >= 0).length;
		// const matchesInStored = storedURLs.filter(storedURL => liveURLs.indexOf(storedURL) >= 0).length;
		// return (live.id === stored.id) ? 1 : (matchesInLive / liveURLs.length * matchesInStored / storedURLs.length);
		return (live.id === stored.id) ? 1 : 0;
	}

	private pushUniqueWindow(array: BT.Window[], window: BT.Window) {
		if (array.some(w => w.id === window.id) === false) {
			array.push(window);
		} else {
			console.warn('duplicate window: ', window.id, window.title);
		}
	}

	private findExtensionWindow(windows: BT.Window[]): BT.Window | undefined {
		return windows.find(w => {
			return (w.tabs.some(t => t.url === chrome.extension.getURL('index.html')));
		});
	}
}