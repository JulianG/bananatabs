import * as React from 'react';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';
import * as BT from '../model/core/CoreTypes';
import { WindowView } from './windowview/WindowView';
import { compareWindows } from '../model/core/CoreComparisons';
import { useSessionMutator } from '../context/ReactContextFactory';

interface Props {
  windows: ReadonlyArray<BT.Window>;
  onWindowCopied(id: number): void;
}

export const WindowListView = React.memo(function WindowListView(props: Props) {
  const { windows, onWindowCopied } = props;
  const sessionMutator = useSessionMutator();

  const itemRenderer = (item: BT.Window, i: number) => {
    return (
      <WindowView
        key={`window-${windows[i].id}`}
        window={windows[i]}
        onCopy={onWindowCopied}
      />
    );
  };

  return (
    <RLDD
      cssClasses="session"
      items={windows as BT.Window[]}
      layout={'vertical'}
      threshold={25}
      dragDelay={250}
      onChange={(items: BT.Window[]) => sessionMutator.setWindows(items)}
      itemRenderer={itemRenderer}
    />
  );
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return compareWindows(prevProps.windows, nextProps.windows);
}
