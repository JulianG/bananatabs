
import * as BT from '../../model/CoreTypes';

/*

we want to return an object
then with that object we want ot be able to both
create a BT.Session and initialise fchrome

hang on! we can initialise fchrome from a BT.Session


HERE!!
we need to make sure the active tab is correct when initialising fchrome

THE CURENT SYNTAX OF [4],1 allows to spefici the focused window,
but not the active tab on each window

HMMMMMM we could change that to use this new syntax!

 */
export function parseSessionString(ss: string): BT.Session {

	let lastId = 1000;

	const windows = _parseSessionString(ss).map(w => {
		w.tabs = w.tabs.map((t, i) => {
			const tab = Object.assign({}, t, { index: i, listIndex: i });
			return Object.assign(BT.getNullTab(), tab, { id: ++lastId });
		});
		return Object.assign(BT.getNullWindow(), w, { id: ++lastId });
	});
	return { ...BT.EmptySession, windows };
}

export function _parseSessionString(ss: string) {
	const windowsRegEx = /\[([^\]]+)\]/g;
	const windows = ss.match(windowsRegEx) || [];
	return windows.map(parseWindowString).filter(s => s != null);
}

function parseWindowString(ws: string) {

	ws = ws.replace('[', '').replace(']', '');
	const tabsRegExp = /\(([^)]+)\)/g;
	const matchedTabs = ws.match(tabsRegExp);

	if (!matchedTabs || matchedTabs.length < 1) { // invalid input string
		throw (new Error('invalid input string'));
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
	let o = {};
	o[n] = v;
	return o;
}

function translatePropName(n: string): string {
	return {
		v: 'visible',
		f: 'focused',
		a: 'active'
	}[n];
}

function convertPropArrayToObject(propList: {}[]): {} {
	return propList.reduce<{}>((acc: {}, p: {}) => Object.assign(acc, p), {});

}