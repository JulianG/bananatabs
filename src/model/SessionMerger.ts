import * as BT from './CoreTypes';

import MutedConsole from '../utils/MutedConsole';
const _console = new MutedConsole();
// const _console = console; // enable logging

export default class SessionMerger {

	mergeSessions(live: BT.Session, stored: BT.Session): BT.Session {

		_console.group('SessionMerger.mergeSessions');

		const mergedSessionWindows: BT.Window[] = [];

		stored.windows.forEach((storedWindow, storedWindowIndex) => {

			_console.group('processing a stored window: ' + storedWindow.id + ' ' + storedWindow.title);

			if (storedWindow.visible === false) {
				_console.log('window is hidden...');
				if (storedWindow.title !== '') {
					_console.log('  pushing a hidden window: ' + storedWindow.title);
					storedWindow.focused = false;
					this.pushUniqueWindow(mergedSessionWindows, storedWindow);
				} else {
					_console.warn('NOT pushing hidden window because title was empty string.');
				}
			} else {
				_console.log('window is visible...');
				_console.log('looking for a live matching window...');

				const liveMatchingWindow = live.windows.find(liveWindow => this.compareWindows(liveWindow, storedWindow) > 0.75);
				if (liveMatchingWindow) {
					_console.log('found liveMatchingWindow: ' + liveMatchingWindow.id + ' ' + liveMatchingWindow.title);
					liveMatchingWindow.title = storedWindow.title;
					liveMatchingWindow.expanded = storedWindow.expanded;
					liveMatchingWindow.tabs = this.mergeTabs(liveMatchingWindow.tabs, storedWindow.tabs);
					_console.log('pushing live matching window: ' + liveMatchingWindow.id + ' ' + liveMatchingWindow.title);
					this.pushUniqueWindow(mergedSessionWindows, liveMatchingWindow);

				} else {
					_console.log('could not find a live matching window');

					if (storedWindow.title !== '') {
						_console.log('pushing a hidden window: ' + storedWindow.id + ' ' + storedWindow.title);
						storedWindow.focused = false;
						storedWindow.visible = false;
						this.pushUniqueWindow(mergedSessionWindows, storedWindow);
					} else {
						_console.log('NOT pushing stored window because title was empty string.');
					}
				}
			}
			_console.groupEnd();
		});

		const chromeExtensionWindow = this.findChromeExtensionWindow(live.windows);
		const nonMatchedWindows = live.windows.filter(liveW => {
			return liveW !== chromeExtensionWindow && !mergedSessionWindows.some(msW => msW.id === liveW.id);
		});

		_console.group('adding nonMatchedWindows...');
		const newSessionWindows = [...mergedSessionWindows, ...nonMatchedWindows];
		_console.table(nonMatchedWindows);
		_console.groupEnd();

		const panelGeometry: BT.Geometry = chromeExtensionWindow ?
			chromeExtensionWindow.geometry
			: { top: 0, left: 0, width: 0, height: 0 };

		_console.groupEnd();

		return { windows: newSessionWindows, panelGeometry };
	}

	private mergeTabs(liveTabs: BT.Tab[], storedTabs: BT.Tab[]): BT.Tab[] {

		_console.groupCollapsed('mergeTabs:');
		_console.log('storedTabs...');
		_console.table(storedTabs);
		_console.log('liveTabs...');
		_console.table(liveTabs);

		_console.log('extraLiveTabs... (tabs in liveTabs not present in storedTabs)');
		const extraLiveTabs = liveTabs.filter(liveTab => {
			return (storedTabs.find(storedTab => storedTab.id === liveTab.id) === undefined);
		});
		_console.table(extraLiveTabs);

		_console.log(`filteredTabs... 
		(storedTabs which are either not visible or are visible AND have a liveTab with the same id)`);
		const filteredTabs: BT.Tab[] = storedTabs.filter((storedTab, i) => {
			return storedTab.visible === false ||
				storedTab.visible && liveTabs.find(liveTab => liveTab.id === storedTab.id);
		});
		_console.table(filteredTabs);

		_console.log(`mergedTabs... 
		(filteredTabs with extraLiveTabs inserted by index... hmmmm not accurate enough?)`);
		const mergedTabs = [...filteredTabs];
		extraLiveTabs.forEach(t => {
			mergedTabs.splice(t.index, 0, t);
		});
		_console.table(mergedTabs);

		_console.log('mergedLiveTabs... mergedTabs fixed to get details from liveTabs where possible');
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
		_console.table(mergedLiveTabs);

		const sortedTabs = mergedLiveTabs.sort((a, b) => {
			const aa = a.index + '.' + a.listIndex;
			const bb = b.index + '.' + b.listIndex;
			return (aa > bb) ? 1 : (aa < bb) ? -1 : 0;
		});

		_console.log('sortedTabs...');
		_console.table(sortedTabs);
		_console.groupEnd();
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
			_console.warn('duplicate window: ', window.id, window.title);
		}
	}

	private findChromeExtensionWindow(windows: BT.Window[]): BT.Window | undefined {
		return windows.find(w => {
			return (w.tabs.some(t => t.url === chrome.extension.getURL('index.html')));
		});
	}
}