import * as BT from './CoreTypes';

export function selectTab(session: BT.Session, winId: number, tabId: number) {
  const windows = session.windows.map(w => {
    return winId === w.id
      ? BT.cloneWindow(w, {
          tabs: w.tabs.map(t => ({ ...t, active: t.id === tabId }))
        })
      : BT.cloneWindow(w);
  });
  return new BT.Session(windows, session.panelWindow);
}

export function mutateTab(
  session: BT.Session,
  winId: number,
  tabId: number,
  props: Partial<BT.Tab>
) {
  const windows = session.windows.map(w => {
    return w.id === winId
      ? {
          ...safeRenameWindow(w),
          tabs: w.tabs.map(t => {
            return t.id === tabId ? BT.cloneTab(t, props) : BT.cloneTab(t);
          })
        }
      : { ...w };
  });
  return new BT.Session(windows, session.panelWindow);
}

export function safeRenameWindow(window: BT.Window): BT.Window {
  return { ...window, title: window.title || 'My Window' };
}

export function deleteTab(session: BT.Session, winId: number, tabId: number) {
  const windows = session.windows.map(w => {
    if (w.id === winId) {
      const tabIndex = w.tabs.findIndex(t => t.id === tabId);
      console.assert(tabIndex >= 0);
      const tabs =
        tabIndex >= 0
          ? [...w.tabs.slice(0, tabIndex), ...w.tabs.slice(tabIndex + 1)]
          : w.tabs.map(t => t);
      return {
        ...safeRenameWindow(w),
        tabs: tabs
      };
    } else {
      return BT.cloneWindow(w);
    }
  });
  return new BT.Session(windows, session.panelWindow);
}

export function mutateWindow(
  session: BT.Session,
  id: number,
  props: Partial<BT.Window>
): BT.Session {
  const windows = session.windows.map(w => {
    return w.id === id
      ? BT.cloneWindow(safeRenameWindow(w), props)
      : BT.cloneWindow(w);
  });
  return new BT.Session(windows, session.panelWindow);
}

export function deleteWindow(session: BT.Session, id: number) {
  const index = session.windows.findIndex(w => w.id === id);
  console.assert(index >= 0);
  const windows =
    index >= 0
      ? [
          ...session.windows.slice(0, index),
          ...session.windows.slice(index + 1)
        ]
      : [...session.windows];
  return new BT.Session(windows, session.panelWindow);
}

export function addWindows(
  session: BT.Session,
  windows: ReadonlyArray<BT.Window>
) {
  return new BT.Session([...session.windows, ...windows], session.panelWindow);
}

export function sortWindows(
  session: BT.Session,
  sortFunction: (a: BT.Window, b: BT.Window) => number
) {
  return new BT.Session(
    [...session.windows].sort(sortFunction),
    session.panelWindow
  );
}
