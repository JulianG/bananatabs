import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';
import { stringToWindows } from './serialisation/MarkdownSerialisation';
import { Session, EmptySession } from './model/CoreTypes';

const hasChrome = !!(chrome && chrome.windows);

const liveSessionWindows = stringToWindows(FakeInitialState.live);
const storedSessionWindows = stringToWindows(FakeInitialState.stored);
const liveSession: Session = { ...EmptySession, windows: liveSessionWindows };
const storedSession: Session = {
  ...EmptySession,
  windows: storedSessionWindows
};
const fake = hasChrome ? { live: liveSession, stored: storedSession } : null;

const factory = new BananaFactory(fake);

export default () => {
  return <BananaTabs factory={factory} />;
};
