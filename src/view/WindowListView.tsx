import * as React from 'react';
import * as BT from '../model/core/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

import WindowView from './WindowView';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';

interface Props {
  windows: ReadonlyArray<BT.Window>;
  sessionMutator: SessionMutator;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onWindowCopied(id: number): void;
}

export default class WindowListView extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.itemRenderer = this.itemRenderer.bind(this);
    this.onListUpdated = this.onListUpdated.bind(this);
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
        key={'window-' + i}
        window={windows[i]}
        windowMutator={this.props.windowMutator}
        tabMutator={this.props.tabMutator}
        onCopy={this.props.onWindowCopied}
      />
    );
  }

  private onListUpdated(items: BT.Window[]) {
    this.props.sessionMutator.updateWindows(items);
  }
}
