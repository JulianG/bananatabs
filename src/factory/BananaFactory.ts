import { PromisingChromeAPI } from '../chrome-api/PromisingChromeAPI';
import RealPromisingChromeAPI from '../chrome-api/RealPromisingChromeAPI';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';

import BrowserController from '../model/mutators/BrowserController';
import ChromeBrowserController from '../chrome/ChromeBrowserController';

import SessionProvider from '../model/SessionProvider';
import DefaultSessionProvider from '../model/DefaultSessionProvider';
import LiveSessionMerger, { DefaultLiveSessionMerger } from '../model/mergers/LiveSessionMerger';
import SessionPersistence from '../model/SessionPersistence';
import SessionMutator, { DefaultSessionMutator } from '../model/mutators/SessionMutator';

import LocalStorageSessionPersistence from '../chrome/LocalStorageSessionPersistence';
import RAMSessionPersistence from '../utils/test-utils/RAMSessionPersistence';

const FAKE_INITIAL_SESSION = require('../utils/dev-utils/initial-session.json');

export default class BananaFactory {

	private chromeAPI: PromisingChromeAPI;
	private persistence: SessionPersistence;
	private liveSessionMerger: LiveSessionMerger;
	private sessionProvider: SessionProvider;
	private sessionMutator: SessionMutator;
	private browserController: BrowserController;

	constructor(private isChromeAPIAvailable: boolean) {
		this.chromeAPI = this.getChromeAPI();
		this.persistence = this.getPersistence();
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

	private getPersistence() {
		if (this.isChromeAPIAvailable) {
			return new LocalStorageSessionPersistence();
		} else {
			return new RAMSessionPersistence(FAKE_INITIAL_SESSION.storedSession);
		}
	}

	private getChromeAPI() {
		return (this.isChromeAPIAvailable) ?
			new RealPromisingChromeAPI() :
			initialiseFakeChromeAPI(FAKE_INITIAL_SESSION.liveSession); // this could be a BT.Session as well
	}

}