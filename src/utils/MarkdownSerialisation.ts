import * as BT from '../model/CoreTypes';


export function windowsToString(windows: BT.Window[]): string {
	return windows.map(w => {
		return `${w.title}:\n${tabsToString(w.tabs)}\n`;
	}).join('\n');
}

function tabsToString(tabs: BT.Tab[]): string {
	return tabs.map(t => ` * ${t.url}`).join('\n');
}

export function stringToWindows(str: string): BT.Window[] {

	let _id = Math.floor(Math.random() * 99999);
	const getId = () => {
		return ++_id;
	};

	const wins: BT.Window[] = [];
	const lines = str.split('\n');

	let win: BT.Window;
	let shouldCreateNewWindow: boolean = true;
	lines.forEach(line => {

		if (shouldCreateNewWindow) {
			shouldCreateNewWindow = false;
			win = {
				...BT.NullWindow,
				id: getId(),
				title: 'Window',
				tabs: [],
				expanded: true
			};
			wins.push(win);
		}
		const isTab = isTabLine(line);
		const isWindowTitle = line.length > 1 && !isTab; // '1' magic number!
		const isEmpty = line.length <= 1;

		if (isWindowTitle) {
			win.title = line.substr(0, line.length - 1);
		}
		if (isTab) {
			const url = extractURL(line);
			if (isValidURL(url)) {
				win.tabs.push({ ...BT.NullTab, url, title: url, id: getId() });
			}
		}
		if (isEmpty) {
			shouldCreateNewWindow = true;
		}
	});

	return wins.filter(w => w.tabs.length > 0);
}

function isTabLine(line: string): boolean {
	return line.substr(0, 3) === ' * ' ||
		line.substr(0, 2) === '* ' ||
		isValidURL(line);
}

function isValidURL(str: string) {
	const trimmed = str.trim();
	return trimmed.substr(0, 7) === 'http://' ||
		trimmed.substr(0, 8) === 'https://';
}

function extractURL(line: string) {
	const lead = detectLeadOnTabLine(line);
	return line.substr(lead).trim();
}

function detectLeadOnTabLine(line: string): number {
	if (line.substr(0, 3) === ' * ') {
		return 3;
	}
	if (line.substr(0, 2) === '* ') {
		return 2;
	}
	if (isValidURL(line)) {
		return 0;
	}
	throw (new Error(`The specified line is not a valid URL. line contents:${line}`));
}