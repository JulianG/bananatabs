import { Session } from '../model/CoreTypes';
import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import RealPromisingChromeAPI from '../chrome-api/RealPromisingChromeAPI';
import BrowserController from '../model/mutators/BrowserController';
import ChromeBrowserController from '../chrome/ChromeBrowserController';
import SessionProvider from '../model/SessionProvider';
import DefaultSessionProvider from '../model/DefaultSessionProvider';
import SessionMerger, {
  DefaultSessionMerger
} from '../model/mergers/SessionMerger';
import SessionMutator, {
  DefaultSessionMutator
} from '../model/mutators/SessionMutator';
import SessionPersistence from '../model/SessionPersistence';
import LocalStorageSessionPersistence from '../chrome/LocalStorageSessionPersistence';
import RAMSessionPersistence from '../utils/RAMSessionPersistence';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

export default class BananaFactory {
  public readonly chromeAPI: PromisingChromeAPI;
  public readonly persistence: SessionPersistence;
  public readonly liveSessionMerger: SessionMerger;
  public readonly sessionProvider: SessionProvider;
  public readonly sessionMutator: SessionMutator;
  public readonly browserController: BrowserController;

  constructor(fakeInitialSessions: { live: Session; stored: Session } | null) {
    this.chromeAPI = fakeInitialSessions
      ? initialiseFakeChromeAPI(fakeInitialSessions.live)
      : new RealPromisingChromeAPI();

    this.persistence = fakeInitialSessions
      ? new RAMSessionPersistence(fakeInitialSessions.stored)
      : new LocalStorageSessionPersistence();

    this.liveSessionMerger = new DefaultSessionMerger();

    this.browserController = new ChromeBrowserController(this.chromeAPI);

    this.sessionProvider = new DefaultSessionProvider(
      this.browserController,
      this.liveSessionMerger,
      this.persistence
    );

    this.sessionMutator = new DefaultSessionMutator(this.sessionProvider);
  }
}
