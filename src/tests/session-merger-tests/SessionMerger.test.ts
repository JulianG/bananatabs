import * as BT from '../../model/CoreTypes';
import * as TestUtils from '../TestUtils';

import SessionMerger from '../../model/SessionMerger';

test('when no windows visible. merged session is same as stored session', () => {
	testSessionsMatch('no-windows');
});

test('when no windows visible. after opening a new window.', () => {
	testSessionsMatch('new-tab');
});

test('when there is only one tab and it is empty. onTabsUpdated status:"complete".', () => {
	testSessionsMatch('on-tab-status-complete');
});

test('when closing or deleting a tab', () => {
	testSessionsMatch('on-tabs-removed');
});

test('when hiding a tab', () => {
	testSessionsMatch('when-hiding-tab');
});

test('when hiding a window', () => {
	testSessionsMatch('when-hiding-window');
});

test('when dragging a tab to a new window', () => {
	testSessionsMatch('when-dragging-tab-out');
});

test('when dropping a tab to an existing window', () => {
	testSessionsMatch('when-dropping-tab-in');
});

///

function testSessionsMatch(name: string) {
	const { live, stored, expected } = getSessions(name);
	const merger = new SessionMerger();
	const mergedSession = merger.mergeSessions(live, stored);
	try {
		expect(TestUtils.compareSessions(mergedSession, expected)).toBeTruthy();
	} catch (e) {
		console.error(e);
		// console.log(JSON.stringify(mergedSession));
		fail();
	}
}

function getSessions(name: string): { live: BT.Session, stored: BT.Session, expected: BT.Session } {
	const live: BT.Session = require(`./${name}/live-session.json`);
	const stored: BT.Session = require(`./${name}/stored-session.json`);
	const expected: BT.Session = require(`./${name}/expected-session.json`);
	return { live, stored, expected };
}
