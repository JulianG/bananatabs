import { Session } from '../model/core/CoreTypes';

import { SessionProvider } from '../model/core/SessionProvider';
import { DefaultSessionProvider } from '../model/DefaultSessionProvider';

import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import { RealPromisingChromeAPI } from '../chrome-api/RealPromisingChromeAPI';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

import { BrowserController } from '../model/browsercontroller/BrowserController';
import { ChromeBrowserController } from '../chrome/ChromeBrowserController';

import { SessionMerger } from '../model/core/SessionMerger';
import { DefaultSessionMerger } from '../model/mergers/DefaultSessionMerger';

import {
  SessionMutator,
  WindowMutator,
  TabMutator
} from '../model/core/Mutators';
import { DefaultSessionMutator } from '../model/mutators/DefaultSessionMutator';
import { DefaultWindowMutator } from '../model/mutators/DefaultWindowMutator';
import { DefaultTabMutator } from '../model/mutators/DefaultTabMutator';

import { SessionPersistence } from '../model/core/SessionPersistence';
import { LocalStorageSessionPersistence } from '../chrome/LocalStorageSessionPersistence';
import { RAMSessionPersistence } from '../utils/RAMSessionPersistence';

export interface BananaContext {
  chromeAPI: PromisingChromeAPI;
  sessionProvider: SessionProvider;
  sessionMutator: SessionMutator;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
}

type Sessions = {
  live: Session;
  stored: Session;
};

export function createRealBananaContext(): BananaContext {
  const chromeAPI: PromisingChromeAPI = new RealPromisingChromeAPI();
  const persistence: SessionPersistence = new LocalStorageSessionPersistence();
  return getNewContext(chromeAPI, persistence);
}

export function createFakeBananaContext(sessions: Sessions): BananaContext {
  const chromeAPI: PromisingChromeAPI = initialiseFakeChromeAPI(sessions.live);
  const persistence: SessionPersistence = new RAMSessionPersistence(sessions.stored);
  return getNewContext(chromeAPI, persistence);
}

function getNewContext(
  chromeAPI: PromisingChromeAPI,
  persistence: SessionPersistence
): BananaContext {
  const sessionMerger: SessionMerger = new DefaultSessionMerger();

  const browserController: BrowserController = new ChromeBrowserController(
    chromeAPI
  );

  const sessionProvider: SessionProvider = new DefaultSessionProvider(
    browserController,
    sessionMerger,
    persistence
  );

  const sessionMutator: SessionMutator = new DefaultSessionMutator(
    sessionProvider
  );
  const windowMutator: WindowMutator = new DefaultWindowMutator(
    sessionProvider,
    browserController
  );
  const tabMutator: TabMutator = new DefaultTabMutator(
    sessionProvider,
    browserController
  );

  return {
    chromeAPI,
    sessionProvider,
    sessionMutator,
    windowMutator,
    tabMutator
  };
}
