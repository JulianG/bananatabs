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
		if (chrome && chrome.windows && chrome.tabs) {
			return new ChromeBrowserController();
		} else {
			console.warn('FakeBrowserController');
			return new FakeBrowserController();
		}
	}

	getSessionProvider(): SessionProvider {

		if (chrome && chrome.windows && chrome.tabs) {
			return new ChromeSessionProvider(new DefaultSessionMerger(), new LocalStorageSessionPersistence());
		} else {
			console.warn('FakeSessionProvider');
			return new FakeSessionProvider(new LocalStorageSessionPersistence());
		}
	}

}