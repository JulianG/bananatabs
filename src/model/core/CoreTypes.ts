
export class Session {
  constructor(
    readonly windows: ReadonlyArray<Window>,
    readonly panelWindow: Window
  ) {}

  getWindow(id: number): Window {
    const win = this.windows.find(w => w.id === id);
    console.assert(
      win,
      `Could not find a window with id ${id} in the current session.`
    );
    return win || getNewWindow({ id });
  }

  getTab(id: number): Tab {
    const win =
      this.windows.find(w => w.tabs.some(t => t.id === id)) || getNewWindow();
    const tab = win.tabs.find(t => t.id === id);
    console.assert(
      tab,
      `Could not find a tab with id ${id} in the current session.`
    );
    return tab || getNewTab({ id });
  }
}

export function cloneSession(session: Session): Session {
  return new Session(
    session.windows.map(w => cloneWindow(w)),
    cloneWindow(session.panelWindow)
  );
}

export interface ListItem {
  readonly id: number;
  readonly title: string;
  readonly visible: boolean;
  readonly icon: string;
}

export interface Window extends ListItem {
  readonly focused: boolean;
  readonly bounds: Rectangle;
  readonly type: string;
  readonly state: string;
  readonly tabs: ReadonlyArray<Tab>;
  readonly expanded: boolean;
}

export function cloneWindow(
  window: Window,
  overrides: Partial<Window> = {}
): Window {
  return { ...window, tabs: window.tabs.map(t => cloneTab(t)), ...overrides };
}

export interface Tab extends ListItem {
  readonly index: number;
  readonly listIndex: number;
  readonly url: string;
  readonly active: boolean;
  readonly selected: boolean;
  readonly highlighted: boolean;
  readonly status: string;
}
export function cloneTab(tab: Tab, overrides: Partial<Tab> = {}): Tab {
  return { ...tab, ...overrides };
}

export interface Rectangle {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export function getNewWindow(overrides: Partial<Window> = {}): Window {
  return Object.assign(
    {
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
    },
    overrides
  );
}

export function getNewTab(overrides: Partial<Tab> = {}): Tab {
  return Object.assign(
    {
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
    },
    overrides
  );
}

export const EmptySession: Session = new Session([], getNewWindow());

export interface DisplayInfo {
  id: string;
  name: string;
  bounds: Rectangle;
  workArea?: Rectangle;
}

export function DEBUG_sessionToString(s: Session): string {
  function replacer(key: string, value: Object) {
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

  return JSON.stringify(s, replacer, 2);
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

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
