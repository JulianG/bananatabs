import { parseSessionString } from './session-string-parser';

describe('testing the tests: session parser function', () => {

	test('valid input string', async () => {

		// given a valid input string
		const inputString = '[!vf(va,!v,v)],[v(,,)]';

		// when it's parsed into a Session
		const session = parseSessionString(inputString);

		// expect the session to have the appropriate attributes
		expect(session.windows).toHaveLength(2);
		expect(session.windows[0].focused).toBeTruthy();
		expect(session.windows[1].focused).toBeFalsy();
		expect(session.windows[0].visible).toBeFalsy();
		expect(session.windows[1].visible).toBeTruthy();
		expect(session.windows[0].tabs).toHaveLength(3);
		expect(session.windows[1].tabs).toHaveLength(3);
		expect(session.windows[0].tabs[0].active).toBeTruthy();
		expect(session.windows[0].tabs[0].visible).toBeTruthy();
		expect(session.windows[0].tabs[1].visible).toBeFalsy();
		expect(session.windows[0].tabs[2].visible).toBeTruthy();

	});

	test('invalid input string: no parenthesis', async () => {

		// given an invalid input string
		const inputString = '[],[]';

		// when it's parsed into a Session
		const f = () => {
			parseSessionString(inputString);
		};

		// expect it to throw an error
		expect(f).toThrowError();

	});

	test('invalid input string: more than 1 group of parenthesis', async () => {

		// given an invalid input string
		const inputString = '[()()]';

		// when it's parsed into a Session
		const f = () => {
			parseSessionString(inputString);
		};

		// expect it to throw an error
		expect(f).toThrowError();

	});

	test('minimum valid input string: one window with 1 tab', async () => {

		// given an invalid input string
		const inputString = '[()]';

		// when it's parsed into a Session
		const session = parseSessionString(inputString);

		// expect it to throw an error
		expect(session.windows).toHaveLength(1);
		expect(session.windows[0].tabs).toHaveLength(1);

	});

});