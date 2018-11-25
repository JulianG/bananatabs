// import * as BT from '../../model/CoreTypes';
import WindowAndTabMutator from '../../model/mutators/WindowAndTabMutator';
import { createIniatilisedProvider, wait } from '../../utils/test-utils/provider-test-factory';

describe('WindowAndTabMutator tests', () => {

	test('hide tab', async () => {

		// given an initialised provider with 1 window and 1 tab
		const { provider, onSessionChanged, fchrome, browserController } = await createIniatilisedProvider('[v(v,v)]');
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

});

