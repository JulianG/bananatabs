import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { WindowMutator, TabMutator } from '../../model/core/Mutators';
import { TabToolsView } from '../TabToolsView';
import { WindowTitle } from './WindowTitle';
import { VisibilityIcon } from './VisibilityIcon';
import { DisclosureButton } from './DisclosureButton';

interface WindowHeaderProps {
  window: BT.Window;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onCopy(windowId: number): void;
}

export const WindowHeader = (props: WindowHeaderProps) => {
  const [renaming, setRenaming] = React.useState(false);

  const { window, windowMutator } = props;

  return (
    <div className="item-row">
      <DisclosureButton {...props} />
      <VisibilityIcon {...props} />
      {!renaming && (
        <TabToolsView
          actionIconVisibility={{ rename: true, delete: true, copy: true }}
          onRenameAction={() => setRenaming(true)}
          onDeleteAction={() => windowMutator.deleteWindow(window.id)}
          onCopyAction={() => props.onCopy(window.id)}
        />
      )}
      <WindowTitle {...props} renaming={renaming} setRenaming={setRenaming} />
    </div>
  );
};
