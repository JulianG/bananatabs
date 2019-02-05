import * as BT from './CoreTypes';

export function compareWindows(
  wins0: ReadonlyArray<BT.Window>,
  wins1: ReadonlyArray<BT.Window>
): boolean {
  return (
    wins0.length === wins1.length &&
    wins0.every((win0, i) => compareWindow(win0, wins1[i]))
  );
}

export function compareWindow(win0: BT.Window, win1: BT.Window): boolean {
  return (
    win0.expanded === win1.expanded &&
    win0.title === win1.title &&
    win0.visible === win1.visible &&
    compareTabs(win0.tabs, win1.tabs)
  );
}

export function compareTabs(
  tabs0: ReadonlyArray<BT.Tab>,
  tabs1: ReadonlyArray<BT.Tab>
): boolean {
  return (
    tabs0.length === tabs1.length &&
    tabs0.every((tab0, i) => compareTab(tab0, tabs1[i]))
  );
}

export function compareTab(tab0: BT.Tab, tab1: BT.Tab): boolean {
  return (
    tab0.id === tab1.id &&
    tab0.url === tab1.url &&
    tab0.visible === tab1.visible &&
    tab0.selected === tab1.selected &&
    tab0.highlighted === tab1.highlighted &&
    tab0.active === tab1.active &&
    tab0.title === tab1.title &&
    tab0.icon === tab1.icon
  );
}
