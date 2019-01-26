export class Session {
  // readonly windows: Window[] = [];
  // readonly panelWindow: Window = getNullWindow();

  static clone(session: Session): Session {
    return new Session(session.windows, session.panelWindow);
  }
  constructor(public readonly windows: Window[], public panelWindow: Window) {}

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
  title: string;
  visible: boolean;
  icon: string;
}

export interface Window extends ListItem {
  id: number;
  focused: boolean;
  bounds: Rectangle;
  type: string;
  state: string;
  tabs: Tab[];
  expanded: boolean;
}

export interface Tab extends ListItem {
  id: number;
  index: number;
  listIndex: number;
  url: string;
  active: boolean;
  selected: boolean;
  highlighted: boolean;
  status: string;
}

export interface Rectangle {
  top: number;
  left: number;
  width: number;
  height: number;
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
