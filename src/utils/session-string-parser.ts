import * as faker from 'faker';
import * as BT from '../model/CoreTypes';

export function parseSessionString(ss: string): BT.Session {

	let lastId = 1000;
	const windows = _parseSessionString(ss).map(w => {
		w.tabs = ensureOneActiveTab(w.tabs.map((t, i) => {
			const tab = Object.assign({}, t, { index: i, listIndex: i });
			return Object.assign(BT.getNullTab(), tab, { id: ++lastId, url: getRandomURL(), title: getRandomTitle() });
		}));
		return Object.assign(BT.getNullWindow(), w, { id: ++lastId });
	});

	if (windows.length < 1 && ss !== '') {
		throw (new Error('Error! Invalid input string.'));
	}
	return { ...BT.EmptySession, windows };
}

function _parseSessionString(ss: string) {
	const windowsRegEx = /\[([^\]]+)\]/g;
	const windows = ss.match(windowsRegEx) || [];
	const validWindows = windows.map(parseWindowString).filter(s => s != null);
	return validWindows;
}

function parseWindowString(ws: string) {

	ws = ws.replace('[', '').replace(']', '');
	const tabsRegExp = /\(([^)]*)\)/g;
	const matchedTabs = ws.match(tabsRegExp);
	if (!matchedTabs || matchedTabs.length !== 1) {
		throw (new Error('Error! Invalid input string.'));
	}
	const windowDefinition = ws.replace(tabsRegExp, '');
	const tabsString = matchedTabs[0];
	const tabs = tabsString.replace('(', '').replace(')', '').split(',').map(parseProps);
	return parseWindowDefinitionString(windowDefinition, tabs);
}

function parseWindowDefinitionString(wd: string, tabs: {}[]) {
	return { ...parseProps(wd), tabs };
}

function parseProps(sp: string): {} {
	const propList = (sp.match(/(!.)|(.)/g) || []).map(parseProp);
	return convertPropArrayToObject(propList);
}

function parseProp(p: string) {
	const v: boolean = p[0] !== '!';
	const n: string = translatePropName(v ? p[0] : p[1]);
	let obj = {};
	switch (n) {
		case 'title':
			obj[n] = faker.hacker.phrase();
			break;
		case undefined:
			break;
		default:
			obj[n] = v;
	}
	return obj;
}

function translatePropName(n: string): string {
	const keys: Object = {
		v: 'visible',
		f: 'focused',
		a: 'active',
		t: 'title'
	};
	if (keys.hasOwnProperty(n)) {
		return keys[n];
	} else {
		throw (`Error! Invalid input string. I don't know what to do with '${n}'.`);
	}
}

function convertPropArrayToObject(propList: {}[]): {} {
	return propList.reduce<{}>((acc: {}, p: {}) => Object.assign(acc, p), {});

}

////

function ensureOneActiveTab(tabs: BT.Tab[]): BT.Tab[] {
	const fixedTabs = [...tabs];
	const visibleTabs = fixedTabs.filter(t => t.visible);
	if (visibleTabs.length > 0) {
		const activeTab = visibleTabs.find(t => t.active) || visibleTabs[0];
		visibleTabs.forEach(vt => {
			vt.active = vt.id === activeTab.id;
		});
	}
	return fixedTabs;
}

function getRandomURL(): string {
	return faker.internet.url();
}

function getRandomTitle(): string {
	return faker.lorem.sentence();
}