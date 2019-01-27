import WindowAndTabMutator from '../../model/mutators/WindowAndTabMutator';
import { wait, createIniatilisedProvider } from '../../_test-utils/';

async function initialise(sessionString: string) {
  const {
    provider,
    fchrome,
    browserController,
    onSessionChanged
  } = await createIniatilisedProvider(sessionString);
  const mutator = new WindowAndTabMutator(provider, browserController);
  return { provider, fchrome, browserController, mutator, onSessionChanged };
}

describe('WindowAndTabMutator tests', () => {
  test('hide tab', async () => {
    // given an initialised provider with 1 window and 2 tabs
    const { provider, fchrome, mutator, onSessionChanged } = await initialise(
      '[v(v,v)]'
    );
    const existingWindow = provider.session.windows[0];
    const windowId = existingWindow.id;
    const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);

    // when a tab is hidden via BananaTabs!
    await mutator.hideTab(windowId, tabIds[1]);
    await wait();

    // expect one fewer tab in the fchrome state
    const fchws = await fchrome.windows.getAll({});
    expect(fchws[0].tabs).toHaveLength(tabIds.length - 1);
    // also expect the session window to contain the same amount of tabs as before
    expect(provider.session.getWindow(windowId).tabs).toHaveLength(tabIds.length);
    // but the affected tab is not visible any more
    expect(provider.session.getTab(tabIds[1]).visible).toBeFalsy();
    // and callback is triggered
    expect(onSessionChanged).toHaveBeenCalled();
  });

  test('show tab', async () => {
    // given an initialised provider with some hidden tabs
    const { provider, fchrome, mutator, onSessionChanged } = await initialise(
      '[vt(v,!v,v,v)]'
    );

    const existingWindow = provider.session.windows[0];
    const windowId = existingWindow.id;
    const tabIds = (existingWindow.tabs || []).map(t => t.id || 0);
    const totalTabs = tabIds.length;

    // when a hidden tab is toggled
    await mutator.showTab(windowId, tabIds[1]);
    await wait();

    // expect fchrome to have one more tab
    const fchws = await fchrome.windows.getAll({});
    expect(fchws[0].tabs).toHaveLength(totalTabs);

    // and and event
    expect(onSessionChanged).toHaveBeenCalled();
  });

  test('show window', async () => {
    // GIVEN an initialised provider with 2 windows, one of them hidden
    const { provider, mutator, fchrome } = await initialise(
      '[v(v,v,v)],[!vt(v,v)]'
    );

    // WHEN the hidden window is shown via BananaTabs!
    await mutator.showWindow(provider.session.windows[1].id);
    await wait(); // for some reason we need to wait one more time
    await wait(); // to guarantee the sessions will be merged.

    // EXPECT two windows in the fchrome api
    const fchws = await fchrome.windows.getAll({});
    expect(fchws).toHaveLength(2);

    // also EXPECT the second window to be visible
    const recentlyOpenedWindow = provider.session.windows[1];
    expect(recentlyOpenedWindow.visible).toBeTruthy();

    // also EXPECT the ids of the visible tabs in the provider session
    // to match the ids of the tabs from the fchrome window
    await wait();

    const getIdsList = (tabs: ReadonlyArray<{ id?: number }>): number[] => {
      return tabs.map(t => t.id!).sort((a, b) => a - b);
    };

    expect(getIdsList(fchws[1].tabs!)).toMatchObject(
      getIdsList(recentlyOpenedWindow.tabs)
    );
  });
});
