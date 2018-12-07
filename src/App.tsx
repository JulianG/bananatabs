import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';
import { stringToSession } from './serialisation/MarkdownSerialisation';

const hasChrome = !!(chrome && chrome.windows);

const liveSession = stringToSession(FakeInitialState.live);
const storedSession = stringToSession(FakeInitialState.stored);
const fake = hasChrome ? null : { live: liveSession, stored: storedSession };

const factory = new BananaFactory(fake);

export default () => {
  return <BananaTabs factory={factory} />;
};
