import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { Icons } from '../icons';
import {
  useWindowMutator,
  useTabMutator,
} from '../../context/ReactContextFactory';

type Props = { window: BT.Window };

export const VisibilityIcon: React.FC<Props> = ({ window }) => {
  const windowMutator = useWindowMutator();
  const tabMutator = useTabMutator();

  const visibilityIconSrc = window.visible ? Icons.On : Icons.Off;
  const visibilityIconText = window.visible ? 'Hide Window' : 'Show Window';
  const imgId = 'win-visibility' + (window.visible ? '-visible' : '-hidden');

  function showWindow() {
    hasVisibleTabs(window)
      ? windowMutator.showWindow(window.id)
      : tabMutator.showTab(window.id, window.tabs[0].id);
  }

  function hideWindow() {
    windowMutator.hideWindow(window.id);
  }

  function toggleVisibility() {
    window.visible ? hideWindow() : showWindow();
  }

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
  return win.tabs.filter((t) => t.visible).length > 0;
}
