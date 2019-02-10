import React from 'react';
import { InputForm } from '../InputForm';

import * as BT from '../../model/core/CoreTypes';
import { WindowMutator } from '../../model/core/Mutators';

type Props = {
  window: BT.Window;
  windowMutator: WindowMutator;
  onCopy(windowId: number): void;
  renaming: boolean;
  setRenaming(b: boolean): void;
};

export const WindowTitle = (props: Props) => {
  const { renaming, setRenaming, window, windowMutator } = props;

  const submitRename = (text: string) => {
    windowMutator.renameWindow(window.id, text);
    setRenaming(false);
  };

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
