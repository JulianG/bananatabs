
import * as BT from '../../model/CoreTypes';
import ChromeBrowserController from '../../chrome/ChromeBrowserController';
import LiveSessionMerger, { DefaultLiveSessionMerger } from '../../model/mergers/LiveSessionMerger';
import SessionPersistence from '../../model/SessionPersistence';
import DefaultSessionProvider from '../../model/DefaultSessionProvider';
import { initialiseFchrome } from './fake-chrome-test-factory';

class RAMSessionPersistence implements SessionPersistence {
	private session: BT.Session;
	async storeSession(session: BT.Session): Promise<{}> {
		this.session = { ...session };
		return {};
	}
	async retrieveSession(): Promise<BT.Session> {
		return this.session || { ...BT.EmptySession };
	}
}

export async function createProvider(windowTabs: number[] = [], focusIndex: number = -1) {

	const fchrome = await initialiseFchrome(windowTabs, focusIndex);
	const browserController = new ChromeBrowserController(fchrome);
	const merger: LiveSessionMerger = new DefaultLiveSessionMerger();
	const pers: SessionPersistence = new RAMSessionPersistence();
	const provider = new DefaultSessionProvider(browserController, merger, pers);
	const onSessionChanged = jest.fn();
	provider.onSessionChanged = onSessionChanged;
	return { provider, onSessionChanged, fchrome, browserController };
}

export async function createInitilisedProvider(windowTabs: number[], focusIndex: number) {
	const { provider, onSessionChanged, fchrome, browserController } = await createProvider(windowTabs, focusIndex);
	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome, browserController };
}

export function wait() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 1);
	});
}
