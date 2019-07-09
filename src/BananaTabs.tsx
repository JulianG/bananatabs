import * as React from 'react';
import { BananaContext } from './context/BananaContext';
import { MainView } from './view/MainView';
import {
  WindowMutatorContext,
  TabMutatorContext,
  SessionMutatorContext,
} from './context/ReactContextFactory';

const MANIFEST = require('./manifest.lnk.json');

console.assert(
  MANIFEST.version !== undefined,
  'manifest.json must contain a "version" key.'
);

interface Props {
  context: BananaContext;
}

const version = MANIFEST.version || '0.0';
const buildString = '';

export const BananaTabs = ({ context }: Props) => {
  const forceUpdate = useForceUpdate();
  const {
    sessionProvider,
    sessionMutator,
    windowMutator,
    tabMutator,
    browserController,
  } = context;

  const handleResizeEvent = (e: UIEvent) => {
    sessionProvider.updateSession();
  };

  React.useEffect(
    () => {
      window.addEventListener('resize', handleResizeEvent);
      sessionProvider.onSessionChanged = _ => {
        forceUpdate();
      };
      sessionProvider.initialiseSession();

      return () => {
        window.removeEventListener('resize', handleResizeEvent);
        sessionProvider.onSessionChanged = _ => {};
      };
    },
    [context]
  );

  return (
    <SessionMutatorContext.Provider value={sessionMutator}>
      <WindowMutatorContext.Provider value={windowMutator}>
        <TabMutatorContext.Provider value={tabMutator}>
          <MainView
            version={version}
            buildString={buildString}
            session={sessionProvider.session}
            browserController={browserController}
          />
        </TabMutatorContext.Provider>
      </WindowMutatorContext.Provider>
    </SessionMutatorContext.Provider>
  );
};

function useForceUpdate() {
  const [, setState] = React.useState({});
  return () => setState({});
}
