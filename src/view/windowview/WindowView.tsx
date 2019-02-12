import * as React from 'react';

import * as BT from '../../model/core/CoreTypes';
import { TabView } from '../TabView';
import { DebugInfo } from '../../utils/DebugUtils';
import { WindowMutator, TabMutator } from '../../model/core/Mutators';
import { compareWindow } from '../../model/core/CoreComparisons';
import { WindowHeader } from './WindowHeader';

interface Props {
  window: BT.Window;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onCopy(windowId: number): void;
}

export const WindowView = React.memo((props: Props) => {
  const { window, tabMutator } = props;

  const classNames = [
    'window-group',
    window.focused ? 'focused' : '',
    window.visible ? 'visible' : 'hidden',
  ].filter(c => !!c);

  return (
    <div
      id="window-group"
      data-testid="window-group"
      className={classNames.join(' ')}
    >
      <DebugInfo item={window} />
      <WindowHeader {...props} />
      <TabList window={window} tabMutator={tabMutator} />
    </div>
  );
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props) {
  return compareWindow(prevProps.window, nextProps.window);
}

////

type TabListProps = { window: BT.Window; tabMutator: TabMutator };

function TabList({ window, tabMutator }: TabListProps) {
  return (
    <div style={{ display: window.expanded ? 'block' : 'none' }}>
      {window.tabs.map((tab, i) => {
        const key = `tab-${tab.id}`;
        return (
          <TabView key={key} window={window} tab={tab} mutator={tabMutator} />
        );
      })}
    </div>
  );
}
