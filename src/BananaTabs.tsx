import * as React from 'react';
import { BananaContext } from './context/BananaContext';
import { MainView } from './view/MainView';

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

export const BananaTabs = ({context}:Props) => {

  const [, setState] = React.useState(0);

  const handleResizeEvent = (e: UIEvent) => {
    context.sessionProvider.updateSession();
  };

  React.useEffect(()=>{

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

  }, [context]);

  return (
    <MainView
      version={version}
      buildString={buildString}
      session={context.sessionProvider.session}
      sessionMutator={context.sessionMutator}
      windowMutator={context.windowMutator}
      tabMutator={context.tabMutator}
    />
  );
}
