import * as React from 'react';

import { WindowMutator, TabMutator, SessionMutator } from '../model/core/Mutators';
import { NullWindowMutator } from '../model/mutators/NullWindowMutator';
import { NullTabMutator } from '../model/mutators/NullTabMutator';
import { NullSessionMutator } from '../model/mutators/NullSessionMutator';

export const SessionMutatorContext = React.createContext<SessionMutator>(new NullSessionMutator());

export const useSessionMutatorContext = () => {
  return React.useContext(SessionMutatorContext);
};

export const WindowMutatorContext = React.createContext<WindowMutator>(new NullWindowMutator());

export const useWindowMutatorContext = () => {
  return React.useContext(WindowMutatorContext);
};

export const TabMutatorContext = React.createContext<TabMutator>(new NullTabMutator());

export const useTabMutatorContext = () => {
  return React.useContext(TabMutatorContext);
};