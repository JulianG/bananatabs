import * as BT from '../../model/CoreTypes';
import * as TestUtils from '../TestUtils';

import { convertLegacySession } from '../../utils/JSONSerialisation';

test('converted session is valid', () => {
	const legacySession = require('./legacy-session.json');
	const convertedSession: BT.Session = convertLegacySession(legacySession);
	expect(TestUtils.compareSessions(convertedSession, legacySession)).toBeTruthy();
});

test('conversion of legacy session ', () => {
	/*
	given a legacy session, when converting, 
	the converted session has bounds for all windows 
	matching the "geometry" property from the legacy session windows
	*/
	const legacySession = require('./legacy-session.json');
	const convertedSession: BT.Session = convertLegacySession(legacySession);
	expect(convertedSession.panelWindow.bounds).toEqual(legacySession.panelWindow.geometry);
	convertedSession.windows.forEach((convertedWindow, i) => {
		expect(convertedWindow.bounds).toEqual(legacySession.windows[i].geometry);
	});
});

test('conversion of current session', () => {
	/*
	given a current session, when converting, 
	the converted session has bounds for all windows 
	matching the "bounds" property from the given session windows
	*/
	const currentSession = require('./current-session.json');
	const convertedSession: BT.Session = convertLegacySession(currentSession);
	expect(convertedSession.panelWindow.bounds).toEqual(currentSession.panelWindow.bounds);
	convertedSession.windows.forEach((convertedWindow, i) => {
		expect(convertedWindow.bounds).toEqual(currentSession.windows[i].bounds);
	});
});