import * as BT from '../model/CoreTypes';

interface LegacyWindow extends BT.Window {
  geometry?: BT.Rectangle;
}

interface LegacySession extends BT.Session {
  windows: LegacyWindow[];
  panelWindow: LegacyWindow;
}

export function convertLegacySession(session: LegacySession): BT.Session {
  const windows = session.windows.map(convertToWindow);
  const panelWindow = convertToWindow(session.panelWindow);
  return { ...session, windows, panelWindow };
}

function convertToWindow(w: LegacyWindow | BT.Window): BT.Window {
  if (isLegacyWindow(w)) {
    const newWindow = Object.assign({}, w, { bounds: w.geometry });
    delete newWindow.geometry;
    return newWindow;
  } else {
    return w;
  }
}

function isLegacyWindow(w: LegacyWindow | BT.Window): w is LegacyWindow {
  return (<LegacyWindow>w).geometry !== undefined;
}
