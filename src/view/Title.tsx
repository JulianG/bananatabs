import * as React from 'react';

interface Props {
  onClick?(): void;
}

export const Title: React.FC<Props> = ({ onClick }) => {
  return (
    <h3>
      <img className="app-icon" src="/icons/app-icon.png" onClick={onClick} />
      &nbsp;<span>Banana Tabs!</span>&nbsp;
    </h3>
  );
};
