import * as BT from '../CoreTypes';

interface TabMutator {
	renameItem(item: BT.ListItem, title: string): void;
	selectTab(window: BT.Window, tab: BT.Tab): void;
	toggleTabVisibility(window: BT.Window, tab: BT.Tab): void;
	hideTab(window: BT.Window, tab: BT.Tab): void;
	showTab(window: BT.Window, tab: BT.Tab): void;
	deleteTab(window: BT.Window, tab: BT.Tab): void;
}

export default TabMutator;