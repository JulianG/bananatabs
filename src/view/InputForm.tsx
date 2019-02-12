import React from 'react';

const ENTER: number = 13;
const ESC: number = 27;

type Props = {
  text: string;
  className?: string;
  inlineStyles?: {};
  onSubmit(text: string): void;
  onCancel(): void;
};

export const InputForm = (props: Props) => {
  const { text, className, inlineStyles, onSubmit, onCancel } = props;

  const [currentText, setText] = React.useState(text);

  const handleKeyUp = ({ keyCode }: { keyCode: number }) => {
    switch (keyCode) {
      case ENTER:
        onSubmit && onSubmit(currentText);
        break;
      case ESC:
        onCancel && onCancel();
        break;
    }
  };

  return (
    <input
      className={className}
      style={inlineStyles}
      autoFocus={true}
      type="text"
      defaultValue={text}
      onKeyUp={handleKeyUp}
      onChange={e => setText(e.target.value)}
      onBlur={() => onCancel()}
    />
  );
};
