import BananaFactory from '../factory/BananaFactory';
import FakePromisingChromeAPI from '../chrome-api/FakePromisingChromeAPI';

describe('banana factory', async () => {

	test('SessionProvider must be singleton', async () => {

		// given a BananaFactory
		const factory = new BananaFactory(new FakePromisingChromeAPI());

		// when calling getSessionProvider more than once
		const provider0 = factory.getSessionProvider();
		const provider1 = factory.getSessionProvider();

		// expect the same instance to be returned every time
		expect(provider0).toBe(provider1);
	});

	test('BrowserController must be singleton', async () => {

		// given a BananaFactory
		const factory = new BananaFactory(new FakePromisingChromeAPI());

		// when calling getBrowserController more than once
		const controller0 = factory.getBrowserController();
		const controller1 = factory.getBrowserController();

		// expect the same instance to be returned every time
		expect(controller0).toBe(controller1);
	});

	test('SessionMutator must be singleton', async () => {

		// given a BananaFactory
		const factory = new BananaFactory(new FakePromisingChromeAPI());

		// when calling getSessionMutator more than once
		const mutator0 = factory.getSessionMutator();
		const mutator1 = factory.getSessionMutator();

		// expect the same instance to be returned every time
		expect(mutator0).toBe(mutator1);
	});
});