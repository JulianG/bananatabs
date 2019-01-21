import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import RealPromisingChromeAPI from '../chrome-api/RealPromisingChromeAPI';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

import BrowserController from '../model/mutators/BrowserController';
import ChromeBrowserController from '../chrome/ChromeBrowserController';

import SessionProvider from '../model/SessionProvider';
import DefaultSessionProvider from '../model/DefaultSessionProvider';
import SessionMerger, {
  DefaultSessionMerger
} from '../model/mergers/SessionMerger';
import SessionPersistence from '../model/SessionPersistence';
import SessionMutator, {
  DefaultSessionMutator
} from '../model/mutators/SessionMutator';

import LocalStorageSessionPersistence from '../chrome/LocalStorageSessionPersistence';
import RAMSessionPersistence from '../utils/RAMSessionPersistence';
import { Session } from '../model/CoreTypes';

export default class BananaFactory {
  private chromeAPI: PromisingChromeAPI;
  private persistence: SessionPersistence;
  private liveSessionMerger: SessionMerger;
  private sessionProvider: SessionProvider;
  private sessionMutator: SessionMutator;
  private browserController: BrowserController;

  constructor(
    private fakeInitialSessions: { live: Session; stored: Session } | null
  ) {
    this.chromeAPI = this.createChromeAPI();
    this.persistence = this.createPersistence();
    this.liveSessionMerger = new DefaultSessionMerger();
    this.browserController = new ChromeBrowserController(this.chromeAPI);
    this.sessionProvider = new DefaultSessionProvider(
      this.browserController,
      this.liveSessionMerger,
      this.persistence
    );
    this.sessionMutator = new DefaultSessionMutator(this.sessionProvider);
  }

  getBrowserController(): BrowserController {
    return this.browserController;
  }

  getSessionProvider(): SessionProvider {
    return this.sessionProvider;
  }

  getSessionMutator(): SessionMutator {
    return this.sessionMutator;
  }

  getChromeAPI() {
    return this.chromeAPI;
  }

  private createChromeAPI() {
    return this.fakeInitialSessions
      ? initialiseFakeChromeAPI(this.fakeInitialSessions.live)
      : new RealPromisingChromeAPI();
  }

  private createPersistence() {
    if (this.fakeInitialSessions) {
      return new RAMSessionPersistence(this.fakeInitialSessions.stored);
    } else {
      return new LocalStorageSessionPersistence();
    }
  }
}
