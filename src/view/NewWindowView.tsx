import * as React from 'react';
import { stringToWindows } from '../serialisation/MarkdownSerialisation';
import { SessionMutator } from '../model/core/Mutators';

interface Props {
  minimumLines: number;
  sessionMutator: SessionMutator;
  onClose(): void;
}

interface State {
  text: string;
  edited: boolean;
}

const stateReducer = (state: State, newState: State) => {
  return { ...state, ...newState };
};

export const NewWindowView = ({
  minimumLines,
  sessionMutator,
  onClose,
}: Props) => {
  const [state, setState] = React.useReducer(stateReducer, {
    text: '',
    edited: false,
  });

  const text = state.text;
  const rows = Math.max(minimumLines, text.split('\n').length);

  const save = () => {
    sessionMutator.addWindows(stringToHiddenWindows(state.text));
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
        rows={rows}
        autoComplete="off"
        wrap="off"
        value={text}
        onChange={event => setState({ text: event.target.value, edited: true })}
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
