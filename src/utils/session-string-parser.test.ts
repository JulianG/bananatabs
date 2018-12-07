import { parseSessionString } from './session-string-parser';

describe('testing the tests: session parser function', () => {

	test('valid empty input string', async () => {

		// given an invalid input string
		const inputString = '';

		// when it's parsed into a Session
		const session = parseSessionString(inputString);

		// expect it to have zero windows
		expect(session.windows).toHaveLength(0);

	});

	test('valid input string: one window with 1 tab', async () => {

		// given an invalid input string
		const inputString = '[()]';

		// when it's parsed into a Session
		const session = parseSessionString(inputString);

		// expect it to throw an error
		expect(session.windows).toHaveLength(1);
		expect(session.windows[0].tabs).toHaveLength(1);

	});

	test('valid input string: one hidden tab', async () => {

		// given a valid input string
		const inputString = '[vt(v,!v)]'; // this test seems to pass even if the window is not titled

		// when it's parsed into a Session
		const session = parseSessionString(inputString);

		// expect the session to have the appropriate attributes
		expect(session.windows).toHaveLength(1);
		expect(session.windows[0].visible).toBeTruthy();
		expect(session.windows[0].tabs).toHaveLength(2);
		expect(session.windows[0].tabs[0].visible).toBeTruthy();
		expect(session.windows[0].tabs[1].visible).toBeFalsy();

	});

	test('valid input string: a bit more complex', async () => {

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

	test('the t character can be used to specify a title for windows', async () => {

		// given an valid input string including the 't' character
		const inputString = '[v(v,v,v)],[!vt(v,v)]';

		// when it's parsed into a Session
		const session = parseSessionString(inputString);

		// expect one of the windows has name and the other one doesn't.
		expect(session.windows[0].title).toBe('');
		expect(session.windows[1].title).not.toBe('');

	});

	test('other characters result in an error', async () => {

		// given an invalid input string because of an invalid character...
		const inputString = '[vn(v,v,v)],[!vt(v,v)]';

		// when it's parsed into a Session
		const f = () => {
			parseSessionString(inputString);
		};

		// expect it to throw an error
		expect(f).toThrowError();

	});

});