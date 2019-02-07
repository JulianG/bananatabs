import { Session } from '../model/core/CoreTypes';

import { SessionProvider } from '../model/SessionProvider';
import { DefaultSessionProvider } from '../model/DefaultSessionProvider';

import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import { RealPromisingChromeAPI } from '../chrome-api/RealPromisingChromeAPI';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

import { BrowserController } from '../model/browsercontroller/BrowserController';
import { ChromeBrowserController } from '../chrome/ChromeBrowserController';

import { SessionMerger } from '../model/mergers/SessionMerger';
import { DefaultSessionMerger } from '../model/mergers/DefaultSessionMerger';

import {
  SessionMutator,
  WindowMutator,
  TabMutator
} from '../model/mutators/Mutators';
import { DefaultSessionMutator } from '../model/mutators/DefaultSessionMutator';
import { DefaultWindowMutator } from '../model/mutators/DefaultWindowMutator';
import { DefaultTabMutator } from '../model/mutators/DefaultTabMutator';

import { SessionPersistence } from '../model/SessionPersistence';
import { LocalStorageSessionPersistence } from '../chrome/LocalStorageSessionPersistence';
import { RAMSessionPersistence } from '../utils/RAMSessionPersistence';

export interface BananaFactory {
  chromeAPI: PromisingChromeAPI;
  persistence: SessionPersistence;
  sessionMerger: SessionMerger;
  browserController: BrowserController;
  sessionProvider: SessionProvider;
  sessionMutator: SessionMutator;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
}

type Sessions = {
  live: Session;
  stored: Session;
};

export function getBananaFactory(
  fakeInitialSessions: Sessions | null
): BananaFactory {
  let chromeAPI: PromisingChromeAPI = fakeInitialSessions
    ? initialiseFakeChromeAPI(fakeInitialSessions.live)
    : new RealPromisingChromeAPI();

  let persistence: SessionPersistence = fakeInitialSessions
    ? new RAMSessionPersistence(fakeInitialSessions.stored)
    : new LocalStorageSessionPersistence();

  let sessionMerger: SessionMerger = new DefaultSessionMerger();

  let browserController: BrowserController = new ChromeBrowserController(
    chromeAPI
  );

  let sessionProvider: SessionProvider = new DefaultSessionProvider(
    browserController,
    sessionMerger,
    persistence
  );

  let sessionMutator: SessionMutator = new DefaultSessionMutator(
    sessionProvider
  );
  let windowMutator: WindowMutator = new DefaultWindowMutator(
    sessionProvider,
    browserController
  );
  let tabMutator: TabMutator = new DefaultTabMutator(
    sessionProvider,
    browserController
  );

  return {
    chromeAPI,
    persistence,
    sessionMerger,
    browserController,
    sessionProvider,
    sessionMutator,
    windowMutator,
    tabMutator
  };
}
