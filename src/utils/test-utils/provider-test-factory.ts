import ChromeBrowserController from '../../chrome/ChromeBrowserController';
import LiveSessionMerger, { DefaultLiveSessionMerger } from '../../model/mergers/LiveSessionMerger';
import RAMSessionPersistence from './RAMSessionPersistence';
import DefaultSessionProvider from '../../model/DefaultSessionProvider';
import { initialiseFakeChromeAPI } from '../initialise-fake-chrome-api';
import FakePromisingChromeAPI from 'chrome-api/FakePromisingChromeAPI';

export function wait() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 1);
	});
}

export async function createProvider(session: string) {
	const fchrome = initialiseFakeChromeAPI(session);
	return { fchrome, ...createProviderWFC(fchrome) };
}

export async function createIniatilisedProvider(session: string) {
	const fchrome = initialiseFakeChromeAPI(session);
	return createInitialisedProviderWFC(fchrome);
}

async function createInitialisedProviderWFC(fchrome: FakePromisingChromeAPI) {
	const { provider, onSessionChanged, browserController } = await createProviderWFC(fchrome);

	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome, browserController };
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