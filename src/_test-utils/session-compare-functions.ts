import * as BT from '../model/core/CoreTypes';

export function compareSessions(s0: BT.Session, s1: BT.Session): boolean {
  const sw0 = s0.windows;
  const sw1 = s1.windows;
  const rsp =
    sw0.length === sw1.length &&
    sw0.every((w0, i) => {
      const w1 = sw1[i];
      return compareWindows(w0, w1);
    });
  if (!rsp) {
    throw `Error: compareSessions: sessions don't match.\n
		s0.windows.length: ${s0.windows.length}\n
		s1.windows.length: ${s1.windows.length}`;
  }
  return rsp;
}

function compareWindows(w0: BT.Window, w1: BT.Window): boolean {
  if (w0.title !== w1.title) {
    throw `Error: compareWindows: window titles don't match:\n
		${w0.title} !== ${w1.title}\n`;
  }
  if (w0.visible !== w1.visible) {
    throw `Error: compareWindows: window visibilities don't match:\n
		${w0.visible} !== ${w1.visible}\n`;
  }
  if (compareTabLists(w0.tabs, w1.tabs) === false) {
    throw `Error: compareWindows: the list of tabs on each window don't match:\n
		${w0.tabs} !== ${w1.tabs}\n`;
  }
  return true;
}

function compareTabLists(tl0: ReadonlyArray<BT.Tab>, tl1: ReadonlyArray<BT.Tab>): boolean {
  const rsp =
    tl0.length === tl1.length && tl0.every((t0, i) => compareTab(t0, tl1[i]));
  if (!rsp) {
    const l0: string = JSON.stringify(tl0, null, 2);
    const l1: string = JSON.stringify(tl1, null, 2);
    throw `Error: compareTabLists:\n${l0}\n\n${l1}`;
  }
  return rsp;
}

function compareTab(t0: BT.Tab, t1: BT.Tab): boolean {
  if (t0.url !== t1.url) {
    const s0 = serialiseItem(t0);
    const s1 = serialiseItem(t1);
    throw `Error: compareTab: non-matching urls in the following tabs:
						\n${s0}\n${s1}
						\n${t0.url} != ${t1.url}`;
  }
  if (t0.visible !== t1.visible) {
    const s0 = serialiseItem(t0);
    const s1 = serialiseItem(t1);
    throw `Error: compareTab: non-matching 'visible' in the following tabs:
						\n${s0}\n${s1}
						\n${t0.visible} != ${t1.visible}`;
  }

  return true;
}

function sortKeys(unordered: Object) {
  const ordered = {};
  Object.keys(unordered)
    .sort()
    .forEach(function(key: string) {
      ordered[key] = unordered[key];
    });
  return ordered;
}

function serialiseItem(item: Object) {
  return JSON.stringify(sortKeys({ ...item, id: 'xxx' }), null, 2);
}
