import * as BT from '../model/CoreTypes';
import DefaultSessionProvider from './DefaultSessionProvider';
import ChromeBrowserController from '../chrome/ChromeBrowserController';
import LiveSessionMerger, { DefaultLiveSessionMerger } from './mergers/LiveSessionMerger';
import SessionPersistence from './SessionPersistence';

import { initialiseFchrome } from '../utils/test-utils/test-factory';
import WindowAndTabMutator from './mutators/WindowAndTabMutator';

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
	const browserController = new ChromeBrowserController(fchrome);
	const merger: LiveSessionMerger = new DefaultLiveSessionMerger();
	const pers: SessionPersistence = new RAMSessionPersistence();
	const provider = new DefaultSessionProvider(browserController, merger, pers);
	const onSessionChanged = jest.fn();
	provider.onSessionChanged = onSessionChanged;
	return { provider, onSessionChanged, fchrome, browserController };
}

async function createInitilisedProvider(windowTabs: number[], focusIndex: number) {
	const { provider, onSessionChanged, fchrome, browserController } = await createProvider(windowTabs, focusIndex);
	provider.onSessionChanged = onSessionChanged;
	await provider.initialiseSession('jest');
	onSessionChanged.mockReset();
	return { provider, onSessionChanged, fchrome, browserController };
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

	test('chromeAPI: create window', async () => {

		// given an initialised provider
		const { provider, onSessionChanged, fchrome } = await createInitilisedProvider([], -1);

		// when a window is created via the Chrome API
		await fchrome.windows.create({});

		// expect the provider session to contain 1 window with 1 tab
		await wait();
		expect(provider.session.windows).toHaveLength(1);
		expect(provider.session.windows[0].tabs).toHaveLength(1);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});

	test('chromeAPI: create tab', async () => {

		// given an initialised provider with 1 window
		const { provider, onSessionChanged, fchrome } = await createInitilisedProvider([1], 0);
		const existingWindow = (await fchrome.windows.getAll({}))[0];
		const windowId = existingWindow.id;
		const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

		// when a tab is created via the Chrome API
		await fchrome.tabs.create({ windowId });

		// also expect the session to contain 1 window with one extra tab
		await wait();
		expect(onSessionChanged.mock.calls[0][0]).toMatchObject(provider.session);
		expect(provider.getWindow(windowId).tabs).toHaveLength(tabIds.length + 1);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});

	test('chromeAPI: close tab', async () => {

		// given an initialised provider with 1 window and 2 tabs
		const { provider, onSessionChanged, fchrome } = await createInitilisedProvider([2], 0);
		const existingWindow = (await fchrome.windows.getAll({}))[0];
		const windowId = existingWindow.id;
		const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

		// when a tab is created via the Chrome API
		await fchrome.tabs.remove(tabIds[1]);

		// also expect the session to contain 1 window with one fewer tab
		await wait();
		expect(provider.getWindow(windowId).tabs).toHaveLength(tabIds.length - 1);
		// and the speficied tab not to be present.
		expect(provider.getWindow(windowId).tabs.filter(t => t.id === tabIds[1])).toHaveLength(0);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});

	test('chromeAPI: close last tab', async () => {

		// given an initialised provider with 1 window and 1 tab
		const { provider, onSessionChanged, fchrome } = await createInitilisedProvider([1], 0);
		const existingWindow = (await fchrome.windows.getAll({}))[0];
		const windowId = existingWindow.id;
		const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

		// when a tab is created via the Chrome API
		await fchrome.tabs.remove(tabIds[0]);
		
		// also expect the session to contain 1 window with one fewer tab
		await wait();
		expect(provider.getWindow(windowId).tabs).toHaveLength(tabIds.length - 1);
		// and the speficied tab not to be present.
		expect(provider.getWindow(windowId).tabs.filter(t => t.id === tabIds[0])).toHaveLength(0);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});

	test('chromeAPI: hide tab via Mutator', async () => {

		// given an initialised provider with 1 window and 1 tab
		const { provider, onSessionChanged, fchrome, browserController } = await createInitilisedProvider([2], 0);
		const existingWindow = (await fchrome.windows.getAll({}))[0];
		const windowId = existingWindow.id;
		const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

		// when a tab is hidden via BananaTabs! (fix other comments)
		// await fchrome.tabs.remove(tabIds[0]);
		const mutator = new WindowAndTabMutator(provider, browserController);
		await mutator.hideTab(windowId, tabIds[1]);
		
		// also expect the session to contain 1 window with one fewer tab
		await wait();
		expect(provider.getWindow(windowId).tabs).toHaveLength(tabIds.length);
		// and the speficied tab not to be present.
		expect(provider.getTab(tabIds[1]).visible).toBeFalsy();
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});
	// MOVE TO MUTATOR TESTS?

});

// what to test?
// SessionProvider should call its callback every time something changes the session data
// for instance?
// when a window or tab is opened or closed via chrome api
// when a window or tab is hidden/shown via BananaTabs (mutators?)
// anything else?

