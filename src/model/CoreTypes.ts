export class Session {

  static clone(session: Session): Session {
    return new Session(session.windows, session.panelWindow);
  }
  constructor(public readonly windows: ReadonlyArray<Window>, public readonly panelWindow: Window) {}

  getWindow(id: number): Window {
    const win = this.windows.find(w => w.id === id);
    console.assert(
      win,
      `Could not find a window with id ${id} in the current session.`
    );
    return win || { ...getNullWindow(), id };
  }

  getTab(id: number): Tab {
    const win =
      this.windows.find(w => w.tabs.some(t => t.id === id)) || getNullWindow();
    const tab = win.tabs.find(t => t.id === id);
    console.assert(
      tab,
      `Could not find a tab with id ${id} in the current session.`
    );
    return tab || { ...getNullTab(), id };
  }
}

export interface ListItem {
  readonly id: number;
  title: string;
  visible: boolean;
  readonly icon: string;
}

export interface Window extends ListItem {
  focused: boolean;
  readonly bounds: Rectangle;
  readonly type: string;
  readonly state: string;
  tabs: ReadonlyArray<Tab>;
  expanded: boolean;
}

export interface Tab extends ListItem {
  readonly index: number;
  readonly listIndex: number;
  readonly url: string;
  active: boolean;
  readonly selected: boolean;
  readonly highlighted: boolean;
  readonly status: string;
}

export interface Rectangle {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export function getNullWindow(): Window {
  return {
    id: 0,
    icon: '',
    title: '',
    visible: false,
    focused: false,
    bounds: { top: 0, left: 0, width: 0, height: 0 },
    type: 'normal',
    state: 'normal',
    tabs: [],
    expanded: false
  };
}

export function getNullTab(): Tab {
  return {
    id: 0,
    title: 'Null Tab',
    icon: '',
    visible: false,
    url: '',
    listIndex: 0,
    index: 0,
    active: false,
    selected: false,
    highlighted: false,
    status: ''
  };
}

export const EmptySession: Session = new Session([], getNullWindow());

export interface DisplayInfo {
  id: string;
  name: string;
  bounds: Rectangle;
  workArea?: Rectangle;
}

export function DEBUG_sessionToString(s: Session): string {
  const f = (key: string, value: Object) => {
    switch (key) {
      case 'windows':
        if (Array.isArray(value)) {
          return value.map(simplifyWindow);
        }
        return value;
      case 'tabs':
        if (Array.isArray(value)) {
          return value.map(simplifyTab);
        }
        return value;
      case 'panelWindow':
        return '';
      default:
        return value;
    }
  };

  return JSON.stringify(s, f, 2);
}

// debug
function simplifyWindow(w: Window) {
  return {
    id: w.id,
    title: w.title,
    visible: w.visible,
    tabNum: w.tabs.length,
    tabs: w.tabs
  };
}

// debug
function simplifyTab(t: Tab) {
  return {
    id: t.id,
    url: t.url,
    visible: t.visible
  };
}
