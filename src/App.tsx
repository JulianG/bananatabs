import * as React from 'react';
import BananaTabs from './BananaTabs';
import BananaFactory from './factory/BananaFactory';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';
import { stringToSession } from './serialisation/MarkdownSerialisation';
import FakeChrome from './chrome-api/FakeChrome';
import FakePromisingChromeAPI from './chrome-api/FakePromisingChromeAPI';

const hasChrome = !!(chrome && chrome.windows);

const liveSession = stringToSession(FakeInitialState.live);
const storedSession = stringToSession(FakeInitialState.stored);
const fakeSessions = hasChrome ? null : { live: liveSession, stored: storedSession };

const factory = new BananaFactory(fakeSessions);

let App: () => JSX.Element;

if (hasChrome) {
  App = () => <BananaTabs factory={factory} />;
} else {
  App = () => {
    const fchrome = factory.getChromeAPI() as FakePromisingChromeAPI;

    // tslint:disable no-string-literal
    window['fchrome'] = fchrome;
    return (
      <div className="split">
        <div className="split-bananatabs">
          <BananaTabs factory={factory} />
        </div>
        <div className="split-browser">
          <FakeChrome api={fchrome} />
        </div>
      </div>
    );
  };
}

export default App;
