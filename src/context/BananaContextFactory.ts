import { Session } from '../model/core/CoreTypes';

import { SessionProvider } from '../model/core/SessionProvider';
import { DefaultSessionProvider } from '../model/DefaultSessionProvider';

import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import { RealPromisingChromeAPI } from '../chrome-api/RealPromisingChromeAPI';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

import { BrowserController } from '../model/browsercontroller/BrowserController';
import { ChromeBrowserController } from '../chrome/ChromeBrowserController';

import { mergeSessions } from '../model/mergers/DefaultSessionMerger';

import {
  SessionMutator,
  WindowMutator,
  TabMutator,
} from '../model/core/Mutators';
import { DefaultSessionMutator } from '../model/mutators/DefaultSessionMutator';
import { DefaultWindowMutator } from '../model/mutators/DefaultWindowMutator';
import { DefaultTabMutator } from '../model/mutators/DefaultTabMutator';

import { SessionPersistence } from '../model/core/SessionPersistence';
import { LocalStorageSessionPersistence } from '../chrome/LocalStorageSessionPersistence';
import { RAMSessionPersistence } from '../utils/RAMSessionPersistence';

import { stringToSession } from '../serialisation/MarkdownSerialisation';

import { BananaContext } from './BananaContext';

export function createRealBananaContext(): BananaContext {
  const chromeAPI: PromisingChromeAPI = new RealPromisingChromeAPI();
  const persistence: SessionPersistence = new LocalStorageSessionPersistence();
  return createContext(chromeAPI, persistence);
}

export function createFakeBananaContext(sessions: {
  live: Session | string;
  stored: Session | string;
}): BananaContext {
  const live = getSession(sessions.live);
  const stored = getSession(sessions.stored);
  const chromeAPI: PromisingChromeAPI = initialiseFakeChromeAPI(live);
  const persistence: SessionPersistence = new RAMSessionPersistence(stored);
  return createContext(chromeAPI, persistence);
}

function getSession(session: string | Session): Session {
  return typeof session === 'string' ? stringToSession(session) : session;
}

export function createContext(
  chromeAPI: PromisingChromeAPI,
  persistence: SessionPersistence
): BananaContext {
  const browserController: BrowserController = new ChromeBrowserController(
    chromeAPI
  );

  const sessionProvider: SessionProvider = new DefaultSessionProvider(
    browserController,
    mergeSessions,
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
    tabMutator,
    browserController,
  };
}