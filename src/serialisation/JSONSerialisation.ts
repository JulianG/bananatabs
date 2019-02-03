import * as BT from '../model/core/CoreTypes';

interface LegacyWindow extends BT.Window {
  geometry?: BT.Rectangle;
}

interface LegacySession extends BT.Session {
  windows: LegacyWindow[];
  panelWindow: LegacyWindow;
}

export function convertLegacySession(session: LegacySession): BT.Session {
  return new BT.Session(
    session.windows.map(convertToWindow),
    convertToWindow(session.panelWindow)
  );
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
  return (w as LegacyWindow).geometry !== undefined;
}
