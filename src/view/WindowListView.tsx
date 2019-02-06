import * as React from 'react';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';
import * as BT from '../model/core/CoreTypes';
import { SessionMutator } from '../model/mutators/SessionMutator';
import { WindowMutator } from '../model/mutators/WindowMutator';
import { TabMutator } from '../model/mutators/TabMutator';
import { WindowView } from './WindowView';
import { compareWindows } from '../model/core/CoreComparisons';

interface Props {
  windows: ReadonlyArray<BT.Window>;
  sessionMutator: SessionMutator;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onWindowCopied(id: number): void;
}

export class WindowListView extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.itemRenderer = this.itemRenderer.bind(this);
    this.onListUpdated = this.onListUpdated.bind(this);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return compareWindows(nextProps.windows, this.props.windows) === false;
  }

  render() {
    const windows = this.props.windows;
    return (
      <RLDD
        cssClasses="session"
        items={[...windows]}
        layout={'vertical'}
        threshold={25}
        dragDelay={250}
        onChange={this.onListUpdated}
        itemRenderer={this.itemRenderer}
      />
    );
  }

  private itemRenderer(item: BT.Window, i: number) {
    const windows = this.props.windows;
    return (
      <WindowView
        key={`window-${windows[i].id}`}
        window={windows[i]}
        windowMutator={this.props.windowMutator}
        tabMutator={this.props.tabMutator}
        onCopy={this.props.onWindowCopied}
      />
    );
  }

  private onListUpdated(items: BT.Window[]) {
    this.props.sessionMutator.setWindows(items);
  }
}
