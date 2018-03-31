import * as BT from '../model/CoreTypes';

export const compareSessions = (s0: BT.Session, s1: BT.Session): boolean => {
	const sw0 = s0.windows;
	const sw1 = s1.windows;
	return sw0.length === sw1.length
		&& sw0.every((w0, i) => {
			const w1 = sw1[i];
			return compareWindows(w0, w1);
		});
};

export const compareWindows = (w0: BT.Window, w1: BT.Window): boolean => {
	return w0.title === w1.title
		&& w0.visible === w1.visible
		&& compareTabLists(w0.tabs, w1.tabs);
};

const compareTabLists = (tl0: BT.Tab[], tl1: BT.Tab[]): boolean => {
	return tl0.length === tl1.length
		&& tl0.every((t0, i) => compareTab(t0, tl1[i]));
};

const compareTab = (t0: BT.Tab, t1: BT.Tab): boolean => {
	return t0.url === t1.url
		&& t0.visible === t1.visible;
};