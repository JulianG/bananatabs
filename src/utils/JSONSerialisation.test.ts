import * as BT from '../model/CoreTypes';
import * as TestUtils from './test-utils/TestUtils';

import { convertLegacySession } from './JSONSerialisation';

const testFiles = '../utils/test-utils/session-merger-test-files/';

test('converted session is valid', () => {

	// given a legacy session
	const legacySession = require(testFiles + 'legacy-session.json');

	// when converting it
	const convertedSession: BT.Session = convertLegacySession(legacySession);

	// expect the converted session compares to the legacy session
	expect(TestUtils.compareSessions(convertedSession, legacySession)).toBeTruthy();
});

test('conversion of legacy session: "geometry" => "bounds" ', () => {

	// given a legacy session
	const legacySession = require(testFiles + 'legacy-session.json');

	// when converting it
	const convertedSession: BT.Session = convertLegacySession(legacySession);

	// expect the converted session has a  "bounds" for all windows 
	// matching the "geometry" property from the legacy session windows
	expect(convertedSession.panelWindow.bounds).toEqual(legacySession.panelWindow.geometry);
	convertedSession.windows.forEach((convertedWindow, i) => {
		expect(convertedWindow.bounds).toEqual(legacySession.windows[i].geometry);
	});

});

test('conversion of current session: "bounds" => "bounds"', () => {
	
	// given a legacy session
	const currentSession = require(testFiles + 'current-session.json');

	// when converting it
	const convertedSession: BT.Session = convertLegacySession(currentSession);

	// the converted session has bounds for all windows 
	// matching the "bounds" property from the given session windows
	expect(convertedSession.panelWindow.bounds).toEqual(currentSession.panelWindow.bounds);
	convertedSession.windows.forEach((convertedWindow, i) => {
		expect(convertedWindow.bounds).toEqual(currentSession.windows[i].bounds);
	});

});