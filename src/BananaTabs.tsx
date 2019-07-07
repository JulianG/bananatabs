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
  const [, setState] = React.useState(0);

  const handleResizeEvent = (e: UIEvent) => {
    context.sessionProvider.updateSession();
  };

  React.useEffect(
    () => {
      window.addEventListener('resize', handleResizeEvent);
      context.sessionProvider.onSessionChanged = _ => {
        setState(Math.random());
      };
      context.sessionProvider.initialiseSession();

      return () => {
        window.removeEventListener('resize', handleResizeEvent);
        context.sessionProvider.onSessionChanged = _ => {
          /**/
        };
      };
    },
    [context]
  );

  return (
    <SessionMutatorContext.Provider value={context.sessionMutator}>
      <WindowMutatorContext.Provider value={context.windowMutator}>
        <TabMutatorContext.Provider value={context.tabMutator}>
          <MainView
            version={version}
            buildString={buildString}
            session={context.sessionProvider.session}
            browserController={context.browserController}
          />
        </TabMutatorContext.Provider>
      </WindowMutatorContext.Provider>
    </SessionMutatorContext.Provider>
  );
};
