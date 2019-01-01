import * as BT from '../model/CoreTypes';

export function windowsToString(windows: BT.Window[]): string {
  return windows
    .map(w => {
      return `${w.title || 'Window'}:\n${tabsToString(w.tabs)}\n`;
    })
    .join('\n');
}

function tabsToString(tabs: BT.Tab[]): string {
  return tabs.map(t => ` * ${t.url}`).join('\n');
}

export function stringToSession(str: string): BT.Session {
  const windows = stringToWindows(str);
  return { ...BT.EmptySession, windows };
}

export function stringToWindows(str: string): BT.Window[] {
  let _id = Math.floor(Math.random() * 99999);
  const getId = () => {
    return ++_id;
  };

  const wins: BT.Window[] = [];
  const lines = str.split('\n');

  let win: BT.Window;
  let tabIndex: number;
  let shouldCreateNewWindow: boolean = true;
  let shouldCreateNewWindowVisibility: boolean = true;
  lines.forEach(line => {
    line = line.trim();
    if (shouldCreateNewWindow) {
      shouldCreateNewWindow = false;
      win = {
        ...BT.getNullWindow(),
        id: getId(),
        title: '',
        tabs: [],
        expanded: true,
        visible: shouldCreateNewWindowVisibility
      };
      tabIndex = 0;
      wins.push(win);
    }
    const isTab = isTabLine(line);
    const isWindowTitle = line.length > 1 && !isTab; // '1' magic number!
    const isEmpty = line.length <= 1;

    if (isWindowTitle) {
      win.title = line.substr(0, line.length - 1);
      const lastChar = line.substr(line.length - 1, 1);
      win.visible = lastChar === ':';
    }
    if (isTab) {
      const url = isValidURL(line.trim())
        ? line.trim()
        : extractURL(line.trim());
      if (isValidURL(url)) {
        const visible = getFirstNonWhitespaceCharacter(line) !== '~';
        win.tabs.push({
          ...BT.getNullTab(),
          visible: visible,
          url,
          title: url,
          id: getId(),
          listIndex: win.tabs.length,
          index: tabIndex
        });
        tabIndex += visible ? 1 : 0;
      }
    }
    if (isEmpty) {
      shouldCreateNewWindow = true;
      if (line.length === 1) {
        shouldCreateNewWindowVisibility = line === ':';
      } else {
        shouldCreateNewWindowVisibility = true;
      }
    }
  });

  return wins.filter(w => w.tabs.length > 0);
}

function isTabLine(line: string): boolean {
  const twoChars = line.trim().substr(0, 2);
  return twoChars === '~ ' || twoChars === '* ' || isValidURL(line);
}

function isValidURL(str: string) {
  const trimmed = str.trim();
  return (
    trimmed.substr(0, 7) === 'http://' || trimmed.substr(0, 8) === 'https://'
  );
}

function extractURL(line: string) {
  const lead = detectLeadOnTabLine(line.trim());
  return line.trim().substr(lead);
}

function detectLeadOnTabLine(line: string): number {
  const twoChars = line.trim().substr(0, 2);
  return twoChars === '* ' || twoChars === '~ ' ? 2 : 0;
}

function getFirstNonWhitespaceCharacter(line: string): string {
  return line.trimLeft().charAt(0);
}
