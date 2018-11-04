import * as BT from '../model/CoreTypes';
import DefaultSessionProvider from './DefaultSessionProvider';
import ChromeBrowserController from '../chrome/ChromeBrowserController';
import LiveSessionMerger, { DefaultLiveSessionMerger } from './mergers/LiveSessionMerger';
import SessionPersistence from './SessionPersistence';

import { initialiseFchrome } from '../utils/test-utils/chrome-events-utils';

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

function wait() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 1);
	});
}

async function createProvider(windowTabs: number[] = [], focusIndex: number = -1) {

	const fchrome = await initialiseFchrome(windowTabs, focusIndex);
	const bc = new ChromeBrowserController(fchrome);
	const merger: LiveSessionMerger = new DefaultLiveSessionMerger();
	const pers: SessionPersistence = new RAMSessionPersistence();
	const provider = new DefaultSessionProvider(bc, merger, pers);
	const onSessionChanged = jest.fn();
	provider.onSessionChanged = onSessionChanged;
	return { provider, onSessionChanged, fchrome };
}

async function createInitilisedProvider(windowTabs: number[], focusIndex: number) {
	const { provider, onSessionChanged, fchrome } = await createProvider(windowTabs, focusIndex);
	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome };
}

//////

describe('initialisation', () => {

	test('initialiseSession results in a call to onSessionChanged', async () => {

		// given an empty provider
		const { provider, onSessionChanged } = await createProvider([], -1);

		// when it's initialised
		await provider.initialiseSession('jest');

		// expect the onSessionChanged callback is triggered at least once, with a valid session
		expect(onSessionChanged).toHaveBeenCalled();
		expect(onSessionChanged.mock.calls[0][0]).toMatchObject(provider.session);
		expect(provider.session.windows).toBeDefined();
		expect(provider.session.panelWindow).toBeDefined();
	});

	test('chromeAPI: create window results in a session with 1 window', async () => {

		// given an initialised provider
		const { provider , onSessionChanged,fchrome } = await createInitilisedProvider([], -1);

		// when a window is created via the Chrome API
		await fchrome.windows.create({});
		
		// expect the provider session to contain 1 window with 1 tab
		await wait();
		expect(provider.session.windows).toHaveLength(1);
		expect(provider.session.windows[0].tabs).toHaveLength(1);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});

	test('chromeAPI: create tab results in session containing 1 window with 2 tabs', async () => {

		// given an initialised provider with 1 window
		const { provider, onSessionChanged, fchrome } = await createInitilisedProvider([1], 0);
		const existingWindow = (await fchrome.windows.getAll({}))[0];
		const windowId = existingWindow.id;
		const previousTabs: number = existingWindow.tabs!.length;

		// when a tab is created via the Chrome API
		await fchrome.tabs.create({ windowId });
		
		// also expect the session to contain 1 window with one extra tab
		await wait();
		expect(onSessionChanged.mock.calls[0][0]).toMatchObject(provider.session);
		expect(provider.getWindow(windowId).tabs).toHaveLength(previousTabs + 1);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});


});

// what to test?
// SessionProvider should call its callback every time something changes the session data
// for instance?
// when a window or tab is opened or closed via chrome api
// when a window or tab is hidden/shown via BananaTabs (mutators?)
// anything else?

