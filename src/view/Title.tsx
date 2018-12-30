import * as React from 'react';

interface Props {
  onClick?(): void;
}

const Title = (props: Props) => {
  return (
    <h3>
      <img
        className="app-icon"
        src="/icons/app-icon.png"
        onClick={props.onClick}
      />
      &nbsp;<span>Banana Tabs!</span>&nbsp;
      <div style={{ display: 'inline' }} className="credits">
        BETA
      </div>
    </h3>
  );
};

export default Title;
