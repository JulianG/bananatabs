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

  const textFieldRef = React.useRef<HTMLInputElement>(null);

  const handleKeyUp = ({ keyCode }: { keyCode: number }) => {
    switch (keyCode) {
      case ENTER:
        const newText = textFieldRef.current
        ? textFieldRef.current.value
        : text;
        onSubmit && onSubmit(newText);
        break;
      case ESC:
        onCancel && onCancel();
        break;
    }
  };

  return (
    <input
      ref={textFieldRef}
      className={className}
      style={inlineStyles}
      autoFocus={true}
      type="text"
      defaultValue={text}
      onKeyUp={handleKeyUp}
      onBlur={() => onCancel()}
    />
  );
};
