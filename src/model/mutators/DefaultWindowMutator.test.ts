import { wait, createIniatilisedProvider } from '../../_test-utils';
import { DefaultWindowMutator } from './DefaultWindowMutator';

async function initialise(sessionString: string) {
  const {
    provider,
    fchrome,
    browserController,
    onSessionChanged
  } = await createIniatilisedProvider(sessionString);
  const windowMutator = new DefaultWindowMutator(provider, browserController);
  return { provider, fchrome, browserController, windowMutator, onSessionChanged };
}

describe('DefaultTabMutator tests', () => {

  test('show window', async () => {
    // GIVEN an initialised provider with 2 windows, one of them hidden
    const { provider, windowMutator, fchrome } = await initialise(
      '[v(v,v,v)],[!vt(v,v)]'
    );

    // WHEN the hidden window is shown via BananaTabs!
    await windowMutator.showWindow(provider.session.windows[1].id);
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
