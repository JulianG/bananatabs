import React from 'react';
import * as BT from '../../model/core/CoreTypes';
import { InputForm } from '../InputForm';
import { useWindowMutator } from '../../context/ReactContextFactory';

type Props = {
  window: BT.Window;
  onCopy(windowId: number): void;
  renaming: boolean;
  setRenaming(b: boolean): void;
};

export const WindowTitle: React.FC<Props> = ({
  renaming,
  setRenaming,
  window,
}) => {
  const windowMutator = useWindowMutator();

  function submitRename(text: string) {
    windowMutator.renameWindow(window.id, text);
    setRenaming(false);
  }

  const tabsStr = window.expanded ? '' : ' (' + window.tabs.length + ' tabs)';
  const fullscreen = window.state === 'fullscreen' ? '(fullscreen)' : '';

  return (
    <>
      {renaming ? (
        <InputForm
          className="window-title"
          text={window.title}
          onSubmit={submitRename}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <span className="window-title" onClick={() => setRenaming(true)}>
          {window.title || 'Window'} <span>{tabsStr}</span>{' '}
          <span>{fullscreen}</span>
        </span>
      )}
      {renaming && <div className="hint">&nbsp;Enter to save&nbsp;</div>}
    </>
  );
};
