import * as React from 'react';
import * as BT from '../model/core/CoreTypes';
import { windowsToString } from '../serialisation/MarkdownSerialisation';

interface Props {
  windows: BT.Window[];
  onClose(): void;
}

export const TextWindowView = ({ windows, onClose }: Props) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const text = windowsToString(windows);

  React.useEffect(
    () => {
      textAreaRef.current && textAreaRef.current.select();
    },
    [text]
  );

  const copyToClipboardAndClose = () => {
    document.execCommand('copy');
    onClose();
  };

  return (
    <div className="textsession" data-testid="text-window-view">
      <textarea
        role="input"
        ref={textAreaRef}
        readOnly={true}
        rows={text.split('\n').length}
        autoComplete="off"
        wrap="off"
        value={text}
      />
      <div className="command-buttons">
        <button className="ok" onClick={copyToClipboardAndClose}>
          Copy to clipboard
        </button>
        <span />
        <button className="cancel" onClick={onClose}>
          Go back
        </button>
      </div>
    </div>
  );
};
