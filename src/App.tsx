import * as React from 'react';
import { BananaTabs } from './BananaTabs';
import { getBananaFactory } from './factory/BananaFactory';
import { ChromeAPIView } from './chrome-api/ChromeAPIView';
import { stringToSession } from './serialisation/MarkdownSerialisation';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';

const hasChrome = !!(chrome && chrome.windows);

const fakeSessions = !hasChrome
  ? {
      live: stringToSession(FakeInitialState.live),
      stored: stringToSession(FakeInitialState.stored)
    }
  : null;

const factory = getBananaFactory(fakeSessions);

const ProductionApp = () => {
  return <BananaTabs factory={factory} />;
};

const DevelopmentApp = () => {
  const chromeAPI = factory.chromeAPI;
  // tslint:disable-next-line no-string-literal
  window['chromeAPI'] = chromeAPI;

  return (
    <div className="split">
      <div className="split-bananatabs">
        <BananaTabs factory={factory} />
      </div>
      <div className="split-browser">
        <ChromeAPIView chromeAPI={chromeAPI} />
      </div>
    </div>
  );
};

const App = hasChrome ? ProductionApp : DevelopmentApp;

export { App };
