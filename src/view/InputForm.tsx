import * as React from 'react';

const ENTER: number = 13;
const ESC: number = 27;

const DoNothing = () => {
  /**/
};

interface Props {
  text: string;
  className?: string;
  inlineStyles?: {};
  onSubmit(text: string): void;
  onCancel(): void;
}

export class InputForm extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    onSubmit: DoNothing,
    onCancel: DoNothing
  };

  private textField: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.textField = React.createRef();
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  render() {
    return (
      <input
        ref={this.textField}
        className={this.props.className}
        style={this.props.inlineStyles}
        autoFocus={true}
        type="text"
        defaultValue={this.props.text}
        onKeyUp={this.handleKeyUp}
        onBlur={this.handleBlur}
      />
    );
  }

  private handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.keyCode) {
      case ENTER:
        const text = this.textField.current
          ? this.textField.current.value
          : this.props.text;
        this.props.onSubmit(text);
        break;
      case ESC:
        this.setState({ tempText: this.props.text });
        this.props.onCancel();
        break;
      default:
    }
  }

  private handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    this.props.onCancel();
  }
}
