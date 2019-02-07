import { Session } from '../model/core/CoreTypes';
import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import { RealPromisingChromeAPI } from '../chrome-api/RealPromisingChromeAPI';
import { BrowserController } from '../model/browsercontroller/BrowserController';
import { ChromeBrowserController } from '../chrome/ChromeBrowserController';
import { SessionProvider } from '../model/SessionProvider';
import { DefaultSessionProvider } from '../model/DefaultSessionProvider';
import {
  SessionMerger,
  DefaultSessionMerger
} from '../model/mergers/SessionMerger';

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
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

export class BananaFactory {
  public readonly chromeAPI: PromisingChromeAPI;
  public readonly persistence: SessionPersistence;
  public readonly sessionMerger: SessionMerger;
  public readonly sessionProvider: SessionProvider;
  public readonly browserController: BrowserController;
  public readonly sessionMutator: SessionMutator;
  public readonly windowMutator: WindowMutator;
  public readonly tabMutator: TabMutator;

  constructor(fakeInitialSessions: { live: Session; stored: Session } | null) {
    this.chromeAPI = fakeInitialSessions
      ? initialiseFakeChromeAPI(fakeInitialSessions.live)
      : new RealPromisingChromeAPI();

    this.persistence = fakeInitialSessions
      ? new RAMSessionPersistence(fakeInitialSessions.stored)
      : new LocalStorageSessionPersistence();

    this.sessionMerger = new DefaultSessionMerger();

    this.browserController = new ChromeBrowserController(this.chromeAPI);

    this.sessionProvider = new DefaultSessionProvider(
      this.browserController,
      this.sessionMerger,
      this.persistence
    );

    this.sessionMutator = new DefaultSessionMutator(this.sessionProvider);
    this.windowMutator = new DefaultWindowMutator(
      this.sessionProvider,
      this.browserController
    );
    this.tabMutator = new DefaultTabMutator(
      this.sessionProvider,
      this.browserController
    );
  }
}
