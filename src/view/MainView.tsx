import * as React from 'react';
import * as BT from '../model/core/CoreTypes';

import { compareWindows } from '../model/core/CoreComparisons';
import { BrowserController } from '../model/browsercontroller/BrowserController';

import { Title } from './Title';
import { WindowListView } from './WindowListView';
import { MainViewCmdButtons } from './MainViewCmdButtons';
import { TextWindowView } from './TextWindowView';
import { NewWindowView } from './NewWindowView';
import { Footer } from './Footer';

interface Props {
  version: string;
  buildString: string;
  session: BT.Session;
  browserController: BrowserController;
}

interface State {
  mode: 'list' | 'read' | 'write';
  windowId: number;
}

interface ChangeMode {
  (mode: State['mode'], windowId?: number): () => void;
}

export const MainView = React.memo(function MainView(props: Props) {
  const { state, setState } = useStateReducer({ mode: 'list', windowId: 0 });

  const changeMode: ChangeMode = (
    mode: State['mode'],
    windowId: number = -1
  ) => {
    return () => setState({ mode, windowId });
  };

  const { version, buildString, session, browserController } = props;

  switch (state.mode) {
    case 'list':
      return (
        <div>
          <Title onClick={() => browserController.dockAppWindow('right', 5)} />
          <WindowListView
            windows={session.windows}
            onWindowCopied={(windowId) => changeMode('read', windowId)()}
          />
          <MainViewCmdButtons
            onPaste={changeMode('write')}
            onCopyAll={changeMode('read')}
          />
          <Footer version={version} buildString={buildString} />
        </div>
      );
    case 'read':
      return (
        <div>
          <Title />
          <TextWindowView
            windows={session.windows.filter((w) => {
              return state.windowId === -1 || w.id === state.windowId;
            })}
            onClose={changeMode('list')}
          />
          <Footer version={version} buildString={buildString} />
        </div>
      );
    case 'write':
      return (
        <div>
          <Title />
          <NewWindowView minimumLines={10} onClose={changeMode('list')} />
          <Footer version={version} buildString={buildString} />
        </div>
      );
    default:
      return null;
  }
}, areEqual);

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return compareWindows(prevProps.session.windows, nextProps.session.windows);
}

function useStateReducer<T>(defaultValue: T) {
  function stateReducer(state: T, newState: Partial<T>) {
    return { ...state, ...newState };
  }
  const [state, setState] = React.useReducer(stateReducer, defaultValue);
  return { state, setState };
}
