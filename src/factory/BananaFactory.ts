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
  private sessionProvider: SessionProvider | undefined;
  private sessionMutator: SessionMutator | undefined;
  private browserController: BrowserController | undefined;

  constructor(
    private fakeInitialSessions: { live: Session; stored: Session } | null
  ) {
    this.chromeAPI = this.createChromeAPI();
    this.persistence = this.createPersistence();
    this.liveSessionMerger = new DefaultSessionMerger();
  }

  getBrowserController(): BrowserController {
    if (!this.browserController) {
      this.browserController = new ChromeBrowserController(this.chromeAPI);
    }
    return this.browserController;
  }

  getSessionProvider(): SessionProvider {
    if (!this.sessionProvider) {
      this.sessionProvider = new DefaultSessionProvider(
        this.getBrowserController(),
        this.liveSessionMerger,
        this.persistence
      );
    }
    return this.sessionProvider;
  }

  getSessionMutator(): SessionMutator {
    if (!this.sessionMutator) {
      this.sessionMutator = new DefaultSessionMutator(
        this.getSessionProvider()
      );
    }
    return this.sessionMutator;
  }

  getChromeAPI() {
    if (!this.chromeAPI) {
      this.chromeAPI = this.createChromeAPI();
    }
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
