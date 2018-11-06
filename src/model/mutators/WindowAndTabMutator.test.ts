import WindowAndTabMutator from '../../model/mutators/WindowAndTabMutator';
import { createInitilisedProvider, wait } from '../../utils/test-utils/provider-test-factory';

describe('WindowAndTabMutator tests', () => {

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