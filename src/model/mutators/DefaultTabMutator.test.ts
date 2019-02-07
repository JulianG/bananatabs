import { wait, createIniatilisedProvider } from '../../_test-utils/';
import { DefaultWindowMutator } from './DefaultWindowMutator';
import { DefaultTabMutator } from './DefaultTabMutator';

async function initialise(sessionString: string) {
  const {
    provider,
    fchrome,
    browserController,
    onSessionChanged
  } = await createIniatilisedProvider(sessionString);
  const tabMutator = new DefaultTabMutator(provider, browserController);
  return { provider, fchrome, browserController, tabMutator, onSessionChanged };
}

describe('DefaultTabMutator tests', () => {
  test('hide tab', async () => {
    // given an initialised provider with 1 window and 2 tabs
    const { provider, fchrome, tabMutator, onSessionChanged } = await initialise(
      '[v(v,v)]'
    );
    const existingWindow = provider.session.windows[0];
    const windowId = existingWindow.id;
    const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

    // when a tab is hidden via BananaTabs!
    await tabMutator.hideTab(windowId, tabIds[1]);
    await wait();

    // expect one fewer tab in the fchrome state
    const fchws = await fchrome.windows.getAll({});
    expect(fchws[0].tabs).toHaveLength(tabIds.length - 1);
    // also expect the session window to contain the same amount of tabs as before
    expect(provider.session.getWindow(windowId).tabs).toHaveLength(
      tabIds.length
    );
    // but the affected tab is not visible any more
    expect(provider.session.getTab(tabIds[1]).visible).toBeFalsy();
    // and callback is triggered
    expect(onSessionChanged).toHaveBeenCalled();
  });

  test('show tab', async () => {
    // given an initialised provider with some hidden tabs
    const { provider, fchrome, tabMutator, onSessionChanged } = await initialise(
      '[vt(v,!v,v,v)]'
    );

    const existingWindow = provider.session.windows[0];
    const windowId = existingWindow.id;
    const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);
    const totalTabs = tabIds.length;

    // when a hidden tab is toggled
    await tabMutator.showTab(windowId, tabIds[1]);
    await wait();

    // expect fchrome to have one more tab
    const fchws = await fchrome.windows.getAll({});
    expect(fchws[0].tabs).toHaveLength(totalTabs);

    // and and event
    expect(onSessionChanged).toHaveBeenCalled();
  });

});
