import * as BT from '../model/CoreTypes';

function tabsToString(tabs: BT.Tab[]): string {
	return tabs.map(t => ` * ${t.url}`).join('\n');
}

export function windowsToString(windows: BT.Window[]): string {
	return windows.map(w => {
		return `${w.title}:\n${tabsToString(w.tabs)}\n`;
	}).join('\n');
}

export function stringToWindows(str: string): BT.Window[] {

	let _id = 1000;
	const getId = () => {
		return ++_id;
	};

	const wins: BT.Window[] = [];
	const lines = str.split('\n');

	let win: BT.Window; // = { ...BT.NullWindow };
	let a: boolean = false;
	lines.forEach(line => {

		if (!a) {
			a = true;
			win = { ...BT.NullWindow, tabs: [], id: getId(), expanded: true, title: 'A' };
			wins.push(win);
		}
		const isTab = isTabLine(line);
		const isWindowTitle = line.length > 1 && !isTab; // '1' magic number!
		const isEmpty = line.length <= 1;

		if (isWindowTitle) {
			win.title = line.substr(0, line.length - 1);
		}
		if (isTab) {
			const url = line.substr(3).trim();
			if (isValidURL(url)) {
				win.tabs.push({ ...BT.NullTab, url, title: url, id: getId() });
			}
		}
		if (isEmpty) {
			a = false;
		}
	});

	return wins.filter(w => w.tabs.length > 0);
}

function isTabLine(line: string) {
	return line.substr(0, 3) === ' * ';
}

function isValidURL(str: string) {
	const trimmed = str.trim();
	return trimmed.substr(0, 7) === 'http://' ||
		trimmed.substr(0, 8) === 'https://';
}