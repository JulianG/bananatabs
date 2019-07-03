import * as React from 'react';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';
import * as BT from '../model/core/CoreTypes';
import {
  SessionMutator,
  WindowMutator,
  TabMutator,
} from '../model/core/Mutators';
import { WindowView } from './windowview/WindowView';
import { compareWindows } from '../model/core/CoreComparisons';

interface Props {
  windows: ReadonlyArray<BT.Window>;
  sessionMutator: SessionMutator;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onWindowCopied(id: number): void;
}

export const WindowListView = React.memo( function WindowListView(props: Props) {
  const windows = props.windows;

  const itemRenderer = (item: BT.Window, i: number) => {
    return (
      <WindowView
        key={`window-${windows[i].id}`}
        window={windows[i]}
        windowMutator={props.windowMutator}
        tabMutator={props.tabMutator}
        onCopy={props.onWindowCopied}
      />
    );
  };

  return (
    <RLDD
      cssClasses="session"
      items={[...windows]}
      layout={'vertical'}
      threshold={25}
      dragDelay={250}
      onChange={(items: BT.Window[]) => props.sessionMutator.setWindows(items)}
      itemRenderer={itemRenderer}
    />
  );
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return compareWindows(prevProps.windows, nextProps.windows);
}
