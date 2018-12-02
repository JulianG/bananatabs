import * as BT from '../../model/CoreTypes';
import WindowAndTabMutator from '../../model/mutators/WindowAndTabMutator';
import { createIniatilisedProvider, wait } from '../../utils/test-utils/provider-test-factory';

describe('WindowAndTabMutator tests', () => {

	test('hide tab', async () => {

		// given an initialised provider with 1 window and 2 tabs
		const { provider, mutator, onSessionChanged } = await getAllTheThings('[v(v,v)]');

		const existingWindow = provider.session.windows[0];
		const windowId = existingWindow.id;
		const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

		// when a tab is hidden via BananaTabs! (fix other comments)
		// await fchrome.tabs.remove(tabIds[0]);
		await mutator.hideTab(windowId, tabIds[1]);

		// also expect the session to contain 1 window with one fewer tab
		await wait();
		expect(provider.getWindow(windowId).tabs).toHaveLength(tabIds.length);
		// and the speficied tab not to be present.
		expect(provider.getTab(tabIds[1]).visible).toBeFalsy();
		// and callback is triggered
		expect(onSessionChanged).toHaveBeenCalled();
	});

	test('show window', async () => {

		// given an initialised provider with 2 windows, one of them hidden
		const {
			provider, mutator, fchrome
		} = await getAllTheThings('[v(v,v)],[!vt(v,v)]');

		// when a hidden window is show via BananaTabs!
		await mutator.showWindow(provider.session.windows[1].id);
		await wait();

		// expect two windows in the fchrome api
		const fchws = await fchrome.windows.getAll({});
		expect(fchws).toHaveLength(2);

		// also expect the second window to be visible
		const recentlyOpenedWindow = provider.session.windows[1];
		expect(recentlyOpenedWindow.visible).toBeTruthy();

		// expect the ids of the visible tabs in the provider session
		// to match the ids of the tabs from the fchrome window

		const findByURL = (tabs: BT.Tab[], url: string) => tabs.find(t => t.url === url);

		fchws[1].tabs!.forEach((realTab, i) => {
			const providerTab = findByURL(recentlyOpenedWindow.tabs, realTab.url!);
			expect(providerTab!.id).toBe(realTab.id);
		});


	});



});

async function getAllTheThings(sessionString: string) {
	const { provider, fchrome, browserController, onSessionChanged } = await createIniatilisedProvider(sessionString);
	const mutator = new WindowAndTabMutator(provider, browserController);
	return { provider, fchrome, browserController, mutator, onSessionChanged };

}

