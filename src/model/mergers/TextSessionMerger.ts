import * as BT from '../CoreTypes';

// import console from '../../utils/MutedConsole';

export default interface TextSessionMerger {
	merge(manual: BT.Window[], stored: BT.Window[]): BT.Window[];
}

export class DefaultTextSessionMerger implements TextSessionMerger {

	merge(manual: BT.Window[], stored: BT.Window[]): BT.Window[] {

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