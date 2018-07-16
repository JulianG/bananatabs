import BrowserController from '../model/mutators/BrowserController';
import FakeBrowserController, { fakeDisplayInfo } from '../fake/FakeBrowserController';
import ChromeBrowserController from '../chrome/ChromeBrowserController';

import SessionProvider from '../model/SessionProvider';
import FakeSessionProvider from '../fake/FakeSessionProvider';
import ChromeSessionProvider from '../chrome/ChromeSessionProvider';
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

	constructor() {
		this.persistence = new LocalStorageSessionPersistence();
		this.liveSessionMerger = new DefaultLiveSessionMerger();
	}

	getBrowserController(): BrowserController {
		if (!this.browserController) {
			if (chrome && chrome.windows && chrome.tabs) {
				this.browserController = new ChromeBrowserController();
			} else {
				this.browserController = new FakeBrowserController([fakeDisplayInfo], []);
			}
		}
		return this.browserController;
	}

	getSessionProvider(): SessionProvider {
		if (!this.sessionProvider) {
			if (chrome && chrome.windows && chrome.tabs) {
				this.sessionProvider = new ChromeSessionProvider(
					this.getBrowserController(),
					this.liveSessionMerger,
					this.persistence
				);
			} else {
				this.sessionProvider = new FakeSessionProvider(this.persistence);
			}
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