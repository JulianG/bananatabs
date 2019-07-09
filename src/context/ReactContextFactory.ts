import * as React from 'react';

import {
  WindowMutator,
  TabMutator,
  SessionMutator,
} from '../model/core/Mutators';

export const SessionMutatorContext = React.createContext<
  SessionMutator | undefined
>(undefined);

export const useSessionMutator = () => {
  const context = React.useContext(SessionMutatorContext);
  if (context === undefined) {
    throw new Error(
      `useSessionMutator must be used withing a SessionMutatorContext.Provider`
    );
  }
  return context;
};

export const WindowMutatorContext = React.createContext<
  WindowMutator | undefined
>(undefined);

export const useWindowMutator = () => {
  const context = React.useContext(WindowMutatorContext);
  if (context === undefined) {
    throw new Error(
      `useWindowMutator must be used withing a WindowMutatorContext.Provider`
    );
  }
  return context;
};

export const TabMutatorContext = React.createContext<TabMutator | undefined>(
  undefined
);

export const useTabMutator = () => {
  const context = React.useContext(TabMutatorContext);
  if (context === undefined) {
    throw new Error(
      `useTabMutator must be used withing a TabMutatorContext.Provider`
    );
  }
  return context;
};
