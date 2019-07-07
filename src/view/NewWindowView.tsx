import * as React from 'react';
import { stringToWindows } from '../serialisation/MarkdownSerialisation';
import { useSessionMutatorContext } from '../context/ReactContextFactory';

interface Props {
  minimumLines: number;
  onClose(): void;
}

export const NewWindowView = ({ minimumLines, onClose }: Props) => {
  const [text, setText] = React.useState('');
  const sessionMutator = useSessionMutatorContext();
  const save = () => {
    sessionMutator.addWindows(stringToHiddenWindows(text));
    onClose();
  };

  return (
    <div className="textsession" data-testid="new-window-view">
      <p>
        You can paste a list of links to be added to Banana Tabs in a new
        window.
      </p>
      <textarea
        role="input"
        autoComplete="off"
        wrap="off"
        value={text}
        rows={Math.max(minimumLines, text.split('\n').length)}
        onChange={event => setText(event.target.value)}
        onKeyUp={event => {
          if (event.keyCode === 13 && event.ctrlKey) {
            save();
          }
        }}
      />
      <div className="command-buttons">
        <button className="ok" onClick={save}>
          Add links
        </button>
        <span />
        <button className="cancel" onClick={onClose}>
          Go back
        </button>
      </div>
    </div>
  );
};

function stringToHiddenWindows(text: string) {
  return stringToWindows(text).map(w => ({ ...w, visible: false }));
}
