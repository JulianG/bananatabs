import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';
import { stringToSession } from './serialisation/MarkdownSerialisation';
import ChromeAPIView from './chrome-api/ChromeAPIView';

const hasChrome = !!(chrome && chrome.windows);

const liveSession = stringToSession(FakeInitialState.live);
const storedSession = stringToSession(FakeInitialState.stored);
const fakeSessions = hasChrome
  ? null
  : { live: liveSession, stored: storedSession };

const factory = new BananaFactory(fakeSessions);

let App: () => JSX.Element;

if (hasChrome) {
  App = () => <BananaTabs factory={factory} />;
} else {
  App = () => {
    const chromeAPI = factory.getChromeAPI();

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
}

export default App;
