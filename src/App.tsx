import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';
import { stringToSession } from './serialisation/MarkdownSerialisation';
import ChromeAPIView from './chrome-api/ChromeAPIView';

const hasChrome = !!(chrome && chrome.windows);

const fakeSessions = !hasChrome
  ? {
      live: stringToSession(FakeInitialState.live),
      stored: stringToSession(FakeInitialState.stored)
    }
  : null;

const factory = new BananaFactory(fakeSessions);

const ProductionApp = () => {
  return <BananaTabs factory={factory} />;
};

const DevelopmentApp = () => {
  const chromeAPI = factory.getChromeAPI();
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

export default App;
