import { SessionProvider } from '../model/core/SessionProvider';
import { BrowserController } from '../model/browsercontroller/BrowserController';
import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import {
  SessionMutator,
  WindowMutator,
  TabMutator,
} from '../model/core/Mutators';

export interface BananaContext {
  chromeAPI: PromisingChromeAPI;
  sessionProvider: SessionProvider;
  sessionMutator: SessionMutator;
  windowMutator: WindowMutator;
  tabMutator: TabMutator;
  browserController: BrowserController;
}
