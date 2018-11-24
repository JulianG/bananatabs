import ChromeBrowserController from '../../chrome/ChromeBrowserController';
import LiveSessionMerger, { DefaultLiveSessionMerger } from '../../model/mergers/LiveSessionMerger';
import RAMSessionPersistence from './RAMSessionPersistence';
import DefaultSessionProvider from '../../model/DefaultSessionProvider';
import { initialiseFchrome } from './fake-chrome-test-factory';
import FakePromisingChromeAPI from 'chrome-api/FakePromisingChromeAPI';

export function wait() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 1);
	});
}

function createProviderWFC(fchrome: FakePromisingChromeAPI) {
	const browserController = new ChromeBrowserController(fchrome);
	const merger: LiveSessionMerger = new DefaultLiveSessionMerger();
	const persistence = new RAMSessionPersistence();
	const provider = new DefaultSessionProvider(browserController, merger, persistence);
	const onSessionChanged = jest.fn();
	provider.onSessionChanged = onSessionChanged;
	return { provider, onSessionChanged, browserController };
}

export async function createProvider(windowTabs: number[], focusIndex: number) {

	const fchrome = await initialiseFchrome(windowTabs, focusIndex);
	return { fchrome, ...createProviderWFC(fchrome) };
}

export async function createInitialisedProviderWFC(fchrome: FakePromisingChromeAPI) {
	const { provider, onSessionChanged, browserController } = await createProviderWFC(fchrome);
	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome, browserController };
}

export async function createIniatilisedProvider(windowTabs: number[], focusIndex: number) {
	const { provider, onSessionChanged, fchrome, browserController } = await createProvider(windowTabs, focusIndex);
	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome, browserController };
}

// async function createProviderFromSession(session: BT.Session) {

// 	const fchrome = await initialiseFchrome([], -1);
// 	const browserController = new ChromeBrowserController(fchrome);
// 	const merger: LiveSessionMerger = new DefaultLiveSessionMerger();
// 	const persistence = new RAMSessionPersistence(session);
// 	const provider = new DefaultSessionProvider(browserController, merger, persistence);
// 	const onSessionChanged = jest.fn();
// 	provider.onSessionChanged = onSessionChanged;
// 	return { provider, onSessionChanged, fchrome, browserController };
// }

// export async function createInitialisedProviderFromSession(session: BT.Session) {
// 	const { provider, onSessionChanged, fchrome, browserController } = await createProviderFromSession(session);
// 	provider.onSessionChanged = onSessionChanged;
// 	await provider.initialiseSession('jest');
// 	onSessionChanged.mockReset();
// 	return { provider, onSessionChanged, fchrome, browserController };
// }