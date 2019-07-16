import * as React from 'react';
import { BananaContext } from './BananaContext';
import {
  WindowMutator,
  TabMutator,
  SessionMutator,
} from '../model/core/Mutators';

function createTypedContext<T>() {
  return React.createContext<T | undefined>(undefined);
}

const SessionMutatorContext = createTypedContext<SessionMutator>();
const WindowMutatorContext = createTypedContext<WindowMutator>();
const TabMutatorContext = createTypedContext<TabMutator>();

type Props = { context: BananaContext };

export const AppContextProvider: React.FC<Props> = ({ context, children }) => {
  return (
    <SessionMutatorContext.Provider value={context.sessionMutator}>
      <WindowMutatorContext.Provider value={context.windowMutator}>
        <TabMutatorContext.Provider value={context.tabMutator}>
          {children}
        </TabMutatorContext.Provider>
      </WindowMutatorContext.Provider>
    </SessionMutatorContext.Provider>
  );
};

export const useSessionMutator = () => {
  const context = React.useContext(SessionMutatorContext);
  if (context === undefined) {
    throw new Error(
      `useSessionMutator must be used withing a SessionMutatorContext.Provider`
    );
  }
  return context;
};

export const useWindowMutator = () => {
  const context = React.useContext(WindowMutatorContext);
  if (context === undefined) {
    throw new Error(
      `useWindowMutator must be used withing a WindowMutatorContext.Provider`
    );
  }
  return context;
};

export const useTabMutator = () => {
  const context = React.useContext(TabMutatorContext);
  if (context === undefined) {
    throw new Error(
      `useTabMutator must be used withing a TabMutatorContext.Provider`
    );
  }
  return context;
};