import * as BT from '../../model/CoreTypes';
import * as TestUtils from '../TestUtils';

import SessionMerger from '../../model/SessionMerger';

const merger = new SessionMerger();

test('when no windows visible. merged session is same as stored session', () => {

	const liveSession: BT.Session = require('./no-windows/empty-live-session.json');
	const storedSession: BT.Session = require('./no-windows/empty-stored-session.json');
	const expectedSession: BT.Session = require('./no-windows/empty-expected-session.json');

	const mergedSession = merger.mergeSessions(liveSession, storedSession);
	expect(TestUtils.compareSessions(mergedSession, expectedSession)).toBeTruthy();

});

test('when no windows visible. after opening a new window.', () => {

	const liveSession: BT.Session = require('./new-tab/onetab-live-session.json');
	const storedSession: BT.Session = require('./new-tab/onetab-stored-session.json');
	const expectedSession: BT.Session = require('./new-tab/onetab-expected-session.json');

	const mergedSession = merger.mergeSessions(liveSession, storedSession);
	expect(TestUtils.compareSessions(mergedSession, expectedSession)).toBeTruthy();

});

test('when there is only one tab and it is empty. onTabsUpdated status:"complete".', () => {

	const liveSession: BT.Session = require('./on-tab-status-complete/example-live-session.json');
	const storedSession: BT.Session = require('./on-tab-status-complete/example-stored-session.json');
	const expectedSession: BT.Session = require('./on-tab-status-complete/example-expected-session.json');

	const mergedSession = merger.mergeSessions(liveSession, storedSession);
	expect(TestUtils.compareSessions(mergedSession, expectedSession)).toBeTruthy();

});


