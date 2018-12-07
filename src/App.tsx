import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';

const factory = new BananaFactory(!!(chrome && chrome.windows));

export default () => {
  return <BananaTabs factory={factory} />;
};
