import * as React from 'react';
import { BananaTabs } from './BananaTabs';
import {
  createRealBananaContext,
  createFakeBananaContext
} from './context/BananaContext';
import { ChromeAPIView } from './chrome-api/ChromeAPIView';
import { stringToSession } from './serialisation/MarkdownSerialisation';
import * as FakeInitialState from './utils/dev-utils/fake-initial-state';

const hasChrome = !!(chrome && chrome.windows);

const ProductionApp = () => {
  const context = createRealBananaContext();
  return <BananaTabs context={context} />;
};

const DevelopmentApp = () => {

  const fakeSessions = {
    live: stringToSession(FakeInitialState.live),
    stored: stringToSession(FakeInitialState.stored)
  };

  const context = createFakeBananaContext(fakeSessions);
  const chromeAPI = context.chromeAPI;
  // tslint:disable-next-line no-string-literal
  window['chromeAPI'] = chromeAPI;

  return (
    <div className="split">
      <div className="split-bananatabs">
        <BananaTabs context={context} />
      </div>
      <div className="split-browser">
        <ChromeAPIView chromeAPI={chromeAPI} />
      </div>
    </div>
  );
};

const App = hasChrome ? ProductionApp : DevelopmentApp;

export { App };
