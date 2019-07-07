import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { Icons } from '../icons';
import { useWindowMutatorContext } from '../../context/ReactContextFactory';

interface DisclosureButtonProps {
  window: BT.Window;
  onCopy(windowId: number): void;
}

export const DisclosureButton = ({ window }: DisclosureButtonProps) => {
  const windowMutator = useWindowMutatorContext();
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
