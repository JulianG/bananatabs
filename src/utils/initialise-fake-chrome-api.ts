import * as BT from '../model/CoreTypes';
import FakePromisingChromeAPI from '../chrome-api/FakePromisingChromeAPI';
import { parseSessionString } from './session-string-parser';

export function initialiseFakeChromeAPI(session: string | BT.Session) {
	const btSession: BT.Session = (typeof (session) === 'string') ? parseSessionString(session) : session;
	return initialiseFchromeFromSession(btSession);
}

function initialiseFchromeFromSession(session: BT.Session) {
	const fchrome = new FakePromisingChromeAPI();
	const visibleWindows = session.windows.filter(w => w.visible);
	fchrome.fakeWindows = visibleWindows.map((w: BT.Window) => {
		const win = fchrome.fake.windows.create({ focused: w.focused });
		win!.tabs!.splice(0, 1); // removing first tab because it's chrome://newtab/
		const windowId = win!.id;
		const visibleTabs = w.tabs.filter(t => t.visible);
		win.tabs = visibleTabs.map(vt => {
			const newTab: chrome.tabs.Tab = fchrome.fake.tabs.create({
				windowId,
				active: vt.active,
				url: vt.url
			});
			newTab.highlighted = vt.highlighted;
			newTab.title = `${vt.url}`;
			return newTab;
		});
		return win;
	});
	return FakePromisingChromeAPI.clone(fchrome);
}