import BananaFactory from '../factory/BananaFactory';
import FakePromisingChromeAPI from '../chrome-api/FakePromisingChromeAPI';

describe('banana factory', async () => {

	test('instanciating', async () => {

		const factory = new BananaFactory(new FakePromisingChromeAPI());
		expect(factory).toBeTruthy(); // w.i.p.
	});

});