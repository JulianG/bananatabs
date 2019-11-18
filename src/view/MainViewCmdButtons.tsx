import * as React from 'react';

interface Props {
  onPaste(): void;
  onCopyAll(): void;
}

export const MainViewCmdButtons: React.FC<Props> = ({ onPaste, onCopyAll }) => {
  return (
    <div className="command-buttons">
      <button className="ok" onClick={onPaste}>
        Add links
      </button>
      <span />
      <button className="cancel" onClick={onCopyAll}>
        Share all windows
      </button>
    </div>
  );
};
