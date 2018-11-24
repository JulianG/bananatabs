import {
	createProvider,
	createIniatilisedProvider,
	createInitialisedProviderWFC,
	wait
} from '../utils/test-utils/provider-test-factory';
import { initialiseFchromeFromSession } from '../utils/test-utils/fake-chrome-test-factory';
import { parseSessionString } from '../utils/test-utils/session-string-parser';

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

});

describe('creating windows and tabs', () => {

	test('chromeAPI: create window', async () => {

		// given an initialised provider
		const { provider, onSessionChanged, fchrome } = await createIniatilisedProvider([], -1);

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
		const { provider, onSessionChanged, fchrome } = await createIniatilisedProvider([1], 0);
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

});

describe('closing tabs', () => {

	test('chromeAPI: close tab in a window with more tabs', async () => {
		await closeTabTest('[v(va,v)]', 0, 1);
	});

	test('chromeAPI: close the only in a window', async () => {
		await closeTabTest('[v(va)]', 0, 0);
	});

	async function closeTabTest(sessionString: string, windowIndex: number, tabIndex: number) {

		const session = parseSessionString(sessionString);
		const fchrome = await initialiseFchromeFromSession(session);

		// given an initialised provider
		const { provider, onSessionChanged } = await createInitialisedProviderWFC(fchrome);
		const existingWindows = (await fchrome.windows.getAll({}));
		const windowId = existingWindows[windowIndex].id;
		const initialTabIds = (existingWindows[windowIndex].tabs || []).map((t, i) => t.id || 0);

		// when a tab is closed/removed via the Chrome API
		await fchrome.tabs.remove(initialTabIds[tabIndex]);

		// also expect the session to contain 1 window with one fewer tab
		await wait();
		expect(provider.getWindow(windowId).tabs).toHaveLength(initialTabIds.length - 1);
		// and the speficied tab not to be present.
		expect(provider.getWindow(windowId).tabs.filter(t => t.id === initialTabIds[tabIndex])).toHaveLength(0);

		// expect the window to be invisible if the closed tab was the only tab in he window
		if (initialTabIds.length === 1) {
			expect(provider.getWindow(windowId).visible).toBeFalsy();
		}
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	}

});

describe('closing windows', () => {

	test('chromeAPI: close the only window [1],0,0', async () => {
		await closeWindowTest('[v(v)]', 0);
	});
	test('chromeAPI: close focused window [1,2],1,1', async () => {
		await closeWindowTest('[v(v)],[vf(v,v)]', 1);
	});
	test('chromeAPI: close non-focused window [1,2,3],1,2', async () => {
		await closeWindowTest('[v(v)],[vf(v,v)],[v(v,v,v)]', 2); // [1, 2, 3], 1
	});
	// TODO: test difference when closing a named window and an unnamed window!

	// 
	async function closeWindowTest(sessionString: string, closingWindowIndex: number) {

		const session = parseSessionString(sessionString);
		const fchrome = await initialiseFchromeFromSession(session);

		// given an initialised provider
		const { provider, onSessionChanged } = await createInitialisedProviderWFC(fchrome);
		const existingWindows = (await fchrome.windows.getAll({}));
		const windowId = existingWindows[closingWindowIndex].id;
		const initialWindowCount = session.windows.length;

		// when the last tab in a window is closed via the Chrome API
		await fchrome.windows.remove(windowId);

		// expect the session to contain one less window
		await wait();
		expect(provider.session.windows).toHaveLength(initialWindowCount - 1);
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	}

});