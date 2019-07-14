import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { TabToolsView } from '../TabToolsView';
import { WindowTitle } from './WindowTitle';
import { VisibilityIcon } from './VisibilityIcon';
import { DisclosureButton } from './DisclosureButton';
import { useWindowMutator } from '../../context/ReactContextFactory';

interface WindowHeaderProps {
  window: BT.Window;
  onCopy(windowId: number): void;
}

export const WindowHeader = (props: WindowHeaderProps) => {
  const [renaming, setRenaming] = React.useState(false);

  const windowMutator = useWindowMutator();

  const { window, onCopy } = props;

  return (
    <div className="item-row">
      <DisclosureButton {...props} />
      <VisibilityIcon {...props} />
      {!renaming && (
        <TabToolsView
          actionIconVisibility={{ rename: true, delete: true, copy: true }}
          onRenameAction={() => setRenaming(true)}
          onDeleteAction={() => windowMutator.deleteWindow(window.id)}
          onCopyAction={() => onCopy(window.id)}
        />
      )}
      <WindowTitle {...props} renaming={renaming} setRenaming={setRenaming} />
    </div>
  );
};
