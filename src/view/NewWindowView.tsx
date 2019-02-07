import * as React from 'react';
import { stringToWindows } from '../serialisation/MarkdownSerialisation';
import { SessionMutator } from '../model/mutators/Mutators';

interface Props {
  minimumLines: number;
  sessionMutator: SessionMutator;
  onClose(): void;
}

interface State {
  text: string;
  edited: boolean;
}

export class NewWindowView extends React.Component<Props, State> {
  readonly state: State = { text: '', edited: false };

  constructor(props: Props) {
    super(props);
    //
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  render() {
    const text = this.state.text;
    const rows = Math.max(this.props.minimumLines, text.split('\n').length);
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
          onChange={this.handleChange}
          onKeyUp={this.handleKeyPress}
        />
        <div className="command-buttons">
          <button className="ok" onClick={this.save}>
            Add links
          </button>
          <span />
          <button className="cancel" onClick={this.props.onClose}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  private handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ text: event.target.value, edited: true });
  }

  private handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.keyCode === 13 && e.ctrlKey) {
      this.save();
    }
  }

  private save() {
    const windows = stringToWindows(this.state.text).map(w => {
      return { ...w, visible: false };
    });
    this.props.sessionMutator.addWindows(windows);
    this.props.onClose();
  }
}
