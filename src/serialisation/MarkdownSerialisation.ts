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

export function stringToWindows(str: string): BT.Window[] {
  let _id = Math.floor(Math.random() * 99999);
  const getId = () => {
    return ++_id;
  };

  const wins: BT.Window[] = [];
  const lines = str.split('\n');

  let win: BT.Window;
  let shouldCreateNewWindow: boolean = true;
  let shouldCreateNewWindowVisibility: boolean = true;
  lines.forEach(line => {
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
      const url = extractURL(line);
      if (isValidURL(url)) {
        win.tabs.push({
          ...BT.getNullTab(),
          visible: getFirstNonWhitespaceCharacter(line) !== '~',
          url,
          title: url,
          id: getId()
        });
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
  return (
    line.substr(0, 3) === ' ~ ' ||
    line.substr(0, 2) === '~ ' ||
    line.substr(0, 3) === ' * ' ||
    line.substr(0, 2) === '* ' ||
    isValidURL(line)
  );
}

function isValidURL(str: string) {
  const trimmed = str.trim();
  return (
    trimmed.substr(0, 7) === 'http://' || trimmed.substr(0, 8) === 'https://'
  );
}

function extractURL(line: string) {
  const lead = detectLeadOnTabLine(line);
  return line.substr(lead).trim();
}

function detectLeadOnTabLine(line: string): number {
  if (line.substr(0, 3) === ' * ' || line.substr(0, 3) === ' ~ ') {
    return 3;
  }
  if (line.substr(0, 2) === '* ' || line.substr(0, 2) === '~ ') {
    return 2;
  }
  return 0;
}

function getFirstNonWhitespaceCharacter(line: string): string {
  return line.trimLeft().charAt(0);
}
