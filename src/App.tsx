import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';
import { stringToWindows } from './serialisation/MarkdownSerialisation';
import { EmptySession } from './model/CoreTypes';

const hasChrome = !!(chrome && chrome.windows);

const liveSessionWindows = stringToWindows(FakeInitialState.live);
const storedSessionWindows = stringToWindows(FakeInitialState.stored);
const liveSession = { ...EmptySession, windows: liveSessionWindows };
const storedSession = { ...EmptySession, windows: storedSessionWindows };

const factory = new BananaFactory(hasChrome, liveSession, storedSession);

export default () => {
  return <BananaTabs factory={factory} />;
};
