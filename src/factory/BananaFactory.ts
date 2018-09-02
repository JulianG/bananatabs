import { PromisingChromeAPI } from 'chrome-api/PromisingChromeAPI';

import BrowserController from '../model/mutators/BrowserController';
import ChromeBrowserController from '../chrome/ChromeBrowserController';

import SessionProvider from '../model/SessionProvider';
import DefaultSessionProvider from '../model/DefaultSessionProvider';
import LiveSessionMerger, { DefaultLiveSessionMerger } from '../model/mergers/LiveSessionMerger';
import SessionPersistence from '../model/SessionPersistence';
import SessionMutator, { DefaultSessionMutator } from '../model/mutators/SessionMutator';

import LocalStorageSessionPersistence from '../chrome/LocalStorageSessionPersistence';

export default class BananaFactory {

	private persistence: SessionPersistence;
	private liveSessionMerger: LiveSessionMerger;
	private sessionProvider: SessionProvider;
	private sessionMutator: SessionMutator;
	private browserController: BrowserController;

	constructor(private chromeAPI: PromisingChromeAPI) {
		this.persistence = new LocalStorageSessionPersistence();
		this.liveSessionMerger = new DefaultLiveSessionMerger();
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

}