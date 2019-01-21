import * as React from 'react';
import * as BT from '../model/CoreTypes';
import { windowsToString } from '../serialisation/MarkdownSerialisation';

interface Props {
  windows: BT.Window[];
  onClose(): void;
}

export default class TextWindowView extends React.Component<Props> {
  private textAreaRef: HTMLTextAreaElement | null | undefined;

  constructor(props: Props) {
    super(props);
    this.copyToClipboardAndClose = this.copyToClipboardAndClose.bind(this);
  }

  render() {
    const text = windowsToString(this.props.windows);
    const rows = text.split('\n').length;
    return (
      <div className="textsession" data-testid="text-window-view">
        <textarea
          role="input"
          ref={ref => (this.textAreaRef = ref)}
          readOnly={true}
          rows={rows}
          autoComplete="off"
          wrap="off"
          value={text}
        />
        <div className="command-buttons">
          <button className="ok" onClick={this.copyToClipboardAndClose}>
            Copy to clipboard
          </button>
          <span />
          <button className="cancel" onClick={this.props.onClose}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.textAreaRef) {
      this.textAreaRef.select();
    }
  }

  private copyToClipboardAndClose() {
    document.execCommand('copy');
    this.props.onClose();
  }
}
