import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { WindowMutator, TabMutator } from '../../model/core/Mutators';
import { Icons } from '../icons';

interface Props {
  window: BT.Window;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
}

export const VisibilityIcon = ({
  window,
  windowMutator,
  tabMutator,
}: Props) => {
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
    window.visible ? hideWindow() : showWindow();
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

function hasVisibleTabs(win: BT.Window): boolean {
  return win.tabs.filter(t => t.visible).length > 0;
}
