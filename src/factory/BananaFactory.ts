import BrowserController from '../model/mutators/BrowserController';
import FakeBrowserController from '../fake/FakeBrowserController';
import ChromeBrowserController from '../chrome/ChromeBrowserController';

import SessionProvider from '../model/SessionProvider';
import FakeSessionProvider from '../fake/FakeSessionProvider';
import ChromeSessionProvider from '../chrome/ChromeSessionProvider';
import { DefaultSessionMerger } from '../model/SessionMerger';

import LocalStorageSessionPersistence from '../chrome/LocalStorageSessionPersistence';

export default class BananaFactory {

	getBrowserController(): BrowserController {
		return (chrome && chrome.windows && chrome.tabs) ?
			new ChromeBrowserController() :
			new FakeBrowserController();
	}

	getSessionProvider(): SessionProvider {
		return (chrome && chrome.windows && chrome.tabs) ?
			new ChromeSessionProvider(new DefaultSessionMerger(), new LocalStorageSessionPersistence()) :
			new FakeSessionProvider(new LocalStorageSessionPersistence());
	}

}