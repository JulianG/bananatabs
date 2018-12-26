import * as BT from '../model/CoreTypes';
import ChromeBrowserController from '../chrome/ChromeBrowserController';
import LiveSessionMerger, { DefaultLiveSessionMerger } from '../model/mergers/LiveSessionMerger';
import RAMSessionPersistence from '../utils/RAMSessionPersistence';
import DefaultSessionProvider from '../model/DefaultSessionProvider';
import { initialiseFakeChromeAPI } from '../utils/initialise-fake-chrome-api';
import FakePromisingChromeAPI from 'chrome-api/FakePromisingChromeAPI';
import { parseSessionString } from '../utils/session-string-parser';

export async function createProvider(sessionString: string) {
	const session = parseSessionString(sessionString);
	const fchrome = initialiseFakeChromeAPI(session);
	return { fchrome, ...createProviderWFC(fchrome, session) };
}

export async function createIniatilisedProvider(sessionString: string) {
	const session = parseSessionString(sessionString);
	const fchrome = initialiseFakeChromeAPI(session);
	return createInitialisedProviderWFC(fchrome, session);
}

async function createInitialisedProviderWFC(fchrome: FakePromisingChromeAPI, session: BT.Session) {
	const { provider, onSessionChanged, browserController } = createProviderWFC(fchrome, session);
	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome, browserController };
}

function createProviderWFC(fchrome: FakePromisingChromeAPI, session: BT.Session) {
	const browserController = new ChromeBrowserController(fchrome);
	const merger: LiveSessionMerger = new DefaultLiveSessionMerger();
	const persistence = new RAMSessionPersistence(session);
	const provider = new DefaultSessionProvider(browserController, merger, persistence);
	const onSessionChanged = jest.fn();
	provider.onSessionChanged = onSessionChanged;
	return { provider, onSessionChanged, browserController };
}