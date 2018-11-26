import * as BT from '../model/CoreTypes';
import FakePromisingChromeAPI from '../chrome-api/FakePromisingChromeAPI';
import { parseSessionString } from './session-string-parser';

export async function initialiseFakeChromeAPI(session: string | BT.Session) {
	const btSession: BT.Session = (typeof (session) === 'string') ? parseSessionString(session) : session;
	return initialiseFchromeFromSession(btSession);
}

async function initialiseFchromeFromSession(session: BT.Session) {

	const fchrome = new FakePromisingChromeAPI;
	const visibleWindows = session.windows.filter(w => w.visible);
	const newWindowPromises = visibleWindows.map(async (w: BT.Window, i) => {
		return new Promise(async (wResolve) => {
			const win = await fchrome.windows.create({ focused: w.focused });
			win!.tabs!.splice(0, 1); // removing first tab because it's chrome://newtab/
			const windowId = win!.id;
			const visibleTabs = w.tabs.filter(t => t.visible);
			const newTabPromises = visibleTabs.map(vt => {
				return new Promise(async (tResolve) => {
					const newTab = await fchrome.tabs.create({
						windowId,
						active: vt.active,
						url: vt.url
					});
					newTab.highlighted = vt.highlighted;
					vt.title = vt.title;
					tResolve(newTab);
				});
			});
			await Promise.all(newTabPromises);
			wResolve(win);
		});
	});
	await Promise.all(newWindowPromises);
	return fchrome;
}