import * as React from 'react';
import { BananaContext } from './context/BananaContext';
import { MainView } from './view/MainView';
import { AppContextProvider } from './context/ReactContextFactory';

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
  const { sessionProvider, browserController } = context;

  React.useEffect(
    () => {
      const handleResizeEvent = (e: UIEvent) => sessionProvider.updateSession();

      window.addEventListener('resize', handleResizeEvent);
      sessionProvider.onSessionChanged = () => forceUpdate();
      sessionProvider.initialiseSession();

      return () => {
        window.removeEventListener('resize', handleResizeEvent);
        sessionProvider.onSessionChanged = () => {};
      };
    },
    [sessionProvider]
  );

  return (
    <AppContextProvider context={context}>
      <MainView
        version={version}
        buildString={buildString}
        session={sessionProvider.session}
        browserController={browserController}
      />
    </AppContextProvider>
  );
};

function useForceUpdate() {
  const [, setState] = React.useState({});
  return () => setState({});
}
