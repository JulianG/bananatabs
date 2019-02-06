import * as React from 'react';

interface Props {
  onClick?(): void;
}

export const Title = (props: Props) => {
  return (
    <h3>
      <img
        className="app-icon"
        src="/icons/app-icon.png"
        onClick={props.onClick}
      />
      &nbsp;<span>Banana Tabs!</span>&nbsp;
    </h3>
  );
};