import { createFakeBananaContext } from './BananaContext';
import { EmptySession } from '../model/core/CoreTypes';

const fakeInitialSessions = { live: EmptySession, stored: EmptySession };

describe('BananaContext tests', async () => {
  test('SessionProvider must be singleton', async () => {
    // given a BananaContext
    const factory = createFakeBananaContext(fakeInitialSessions);

    // when calling getSessionProvider more than once
    const provider0 = factory.sessionProvider;
    const provider1 = factory.sessionProvider;

    // expect the same instance to be returned every time
    expect(provider0).toBe(provider1);
  });

  test('BrowserController must be singleton', async () => {
    // given a BananaContext
    const factory = createFakeBananaContext(fakeInitialSessions);

    // when calling getBrowserController more than once
    const controller0 = factory.browserController;
    const controller1 = factory.browserController;

    // expect the same instance to be returned every time
    expect(controller0).toBe(controller1);
  });

  test('SessionMutator must be singleton', async () => {
    // given a BananaContext
    const factory = createFakeBananaContext(fakeInitialSessions);

    // when calling getSessionMutator more than once
    const mutator0 = factory.sessionMutator;
    const mutator1 = factory.sessionMutator;

    // expect the same instance to be returned every time
    expect(mutator0).toBe(mutator1);
  });

  test('ChromeAPI must be singleton', async () => {
    // given a BananaContext
    const factory = createFakeBananaContext(fakeInitialSessions);

    // when calling getChromeAPI more than once
    const api0 = factory.chromeAPI;
    const api1 = factory.chromeAPI;

    // expect the same instance to be returned every time
    expect(api0).toBe(api1);
  });
});
