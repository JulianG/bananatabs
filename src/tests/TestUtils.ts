import * as BT from '../model/CoreTypes';

export function compareSessions(s0: BT.Session, s1: BT.Session): boolean {
	const sw0 = s0.windows;
	const sw1 = s1.windows;
	const rsp = sw0.length === sw1.length
		&& sw0.every((w0, i) => {
			const w1 = sw1[i];
			return compareWindows(w0, w1);
		});
	if (!rsp) {
		throw (`Error: TestUtil.compareSessions: sessions don't match`);
	}
	return rsp;
}

function compareWindows(w0: BT.Window, w1: BT.Window): boolean {
	const rsp = w0.title === w1.title
		&& w0.visible === w1.visible
		&& compareTabLists(w0.tabs, w1.tabs);
	if (!rsp) {
		throw (`Error: TestUtil.compareWindows: window id:${w0.id} is not same as window id:${w1.id}`);
	}
	return rsp;
}

function compareTab(t0: BT.Tab, t1: BT.Tab): boolean {
	const rsp = t0.url === t1.url
		&& t0.visible === t1.visible;
	if (!rsp) {
		const s0 = JSON.stringify(t0);
		const s1 = JSON.stringify(t1);
		throw (`Error: TestUtil.compareTab: tab id:\n${s0}\n---\n${s1}`);
	}
	return rsp;
}

function compareTabLists(tl0: BT.Tab[], tl1: BT.Tab[]): boolean {
	const rsp = tl0.length === tl1.length
		&& tl0.every((t0, i) => compareTab(t0, tl1[i]));
	if (!rsp) {
		const l0: string = JSON.stringify(tl0, null, 2);
		const l1: string = JSON.stringify(tl1, null, 2);
		const msg = `Error: TestUtil.compareTabLists:\n${l0}\n-----\n${l1}`;
		throw (msg);
	}
	return rsp;
}

