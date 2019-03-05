import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { WindowMutator, TabMutator } from '../../model/core/Mutators';
import { TabToolsView } from '../TabToolsView';
import { WindowTitle } from './WindowTitle';

const Icons = {
  Edit: require('../icons/edit.svg'),
  On: require('../icons/on.svg'),
  Off: require('../icons/off.svg'),
  Delete: require('../icons/delete.svg'),
  ArrowDown: require('../icons/arrow-down.svg'),
  ArrowRight: require('../icons/arrow-right.svg'),
};

interface Props {
  window: BT.Window;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  onCopy(windowId: number): void;
}

export const WindowHeader = (props: Props) => {
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

const VisibilityIcon = ({ window, windowMutator, tabMutator }: Props) => {
  const visibilityIconSrc = window.visible ? Icons.On : Icons.Off;
  const visibilityIconText = window.visible ? 'Hide Window' : 'Show Window';
  const imgId = 'win-visibility' + (window.visible ? '-visible' : '-hidden');

  const showWindow = () => {
    hasVisibleTabs(window)
      ? windowMutator.showWindow(window.id)
      : tabMutator.showTab(window.id, window.tabs[0].id);
  };

  const hideWindow = () => {
    windowMutator.hideWindow(window.id);
  };

  const toggleVisibility = () => {
    window.visible
      ? hideWindow()
      : showWindow();
  };

  return (
    <img
      data-testid="visibility-toggle"
      id={imgId}
      alt={'win' + (window.visible ? '-visible' : '-hidden')}
      className="tool icon"
      src={visibilityIconSrc}
      title={visibilityIconText}
      onClick={toggleVisibility}
    />
  );
};

const DisclosureButton = ({ window, windowMutator }: Props) => {
  const iconSrc = window.expanded ? Icons.ArrowDown : Icons.ArrowRight;
  const iconText = window.expanded ? 'Collapse' : 'Expand';
  const iconStyles = ['tool', 'icon', window.visible ? '' : 'hidden'];

  function toggleCollapse() {
    window.expanded
      ? windowMutator.collapseWindow(window.id)
      : windowMutator.expandWindow(window.id);
  }

  return (
    <img
      id="disclosure"
      alt={`window-disclosure-${window.expanded ? 'expanded' : 'collapsed'}`}
      className={iconStyles.join(' ')}
      src={iconSrc}
      title={iconText}
      onClick={toggleCollapse}
    />
  );
};

function hasVisibleTabs(win: BT.Window): boolean {
  return win.tabs.filter(t => t.visible).length > 0;
}