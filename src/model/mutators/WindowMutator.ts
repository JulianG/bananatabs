import * as BT from '../CoreTypes';

interface WindowMutator {
	renameItem(item: BT.ListItem, title: string): void;
	collapseWindow(window: BT.Window): void;
	expandWindow(window: BT.Window): void;
	toggleWindowVisibility(window: BT.Window): void;
	hideWindow(window: BT.Window): void;
	showWindow(window: BT.Window): void;
	deleteWindow(window: BT.Window): void;
}

export default WindowMutator;