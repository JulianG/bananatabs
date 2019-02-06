import * as React from 'react';

interface Props {
  version: string;
  buildString: string;
}

export const Footer = ({ version, buildString }: Props) => {
  const showCredits = () => {
    window.alert(`BananaTabs! version ${version} ${buildString}
    `);
  };

  return (
    <div className="credits">
      <p>
        <strong onClick={showCredits} title="click for version">BananaTabs!</strong>
        <br />
        Developed by Julian Garamendy.
        <br />
        Icons designed by Dave Gandy from&nbsp;
        <a href="https://www.flaticon.com/packs/font-awesome" target="_blank">
          FlatIcon
        </a>
        . - Banana icon by Freepik from&nbsp;
        <a
          href="https://www.flaticon.com/free-icon/banana_688828"
          target="_blank"
        >
          FlatIcon
        </a>
        .
      </p>
    </div>
  );
};
