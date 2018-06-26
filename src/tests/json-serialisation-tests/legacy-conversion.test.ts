import * as BT from '../../model/CoreTypes';
import * as TestUtils from '../TestUtils';

import { convertLegacySession } from '../../utils/JSONSerialisation';

test('converted session is valid', () => {
	const legacySession = require('./legacy-session.json');
	const convertedSession: BT.Session = convertLegacySession(legacySession);
	expect(TestUtils.compareSessions(convertedSession, legacySession)).toBeTruthy();
});

test('given a legacy session, when converting, converted session has bounds for all windows matching "geometry" from legacy session', () => {
	const legacySession = require('./legacy-session.json');
	const convertedSession: BT.Session = convertLegacySession(legacySession);
	expect(convertedSession.panelWindow.bounds).toEqual(legacySession.panelWindow.geometry);
	convertedSession.windows.forEach((convertedWindow, i) => {
		expect(convertedWindow.bounds).toEqual(legacySession.windows[i].geometry);
	});
});

test('given a current session, when converting, converted session has bounds for all windows matching "bounds" from given session', () => {
	const currentSession = require('./current-session.json');
	const convertedSession: BT.Session = convertLegacySession(currentSession);
	expect(convertedSession.panelWindow.bounds).toEqual(currentSession.panelWindow.bounds);
	convertedSession.windows.forEach((convertedWindow, i) => {
		expect(convertedWindow.bounds).toEqual(currentSession.windows[i].bounds);
	});
});