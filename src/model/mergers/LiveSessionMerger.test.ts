import * as BT from '../../model/CoreTypes';
import { compareSessions } from '../../utils/test-utils/TestUtils';

import { DefaultLiveSessionMerger } from './LiveSessionMerger';

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

test('when reopening browser with no changes', () => {
	testSessionsMatch('restoring-session-no-changes');
});

test('when reopening browser after having added 1 tab to a window with 2 tabs', () => {
	testSessionsMatch('restoring-session-adding-1-to-2');
});

test('when reopening browser after having added 1 tab to a window with 4 tabs', () => {
	testSessionsMatch('restoring-session-adding-1-to-4');
});

///

function testSessionsMatch(name: string) {
	const { live, stored, expected } = getSessions(name);
	const merger = new DefaultLiveSessionMerger();
	const mergedSession = merger.merge(live, stored);
	try {
		expect(compareSessions(mergedSession, expected)).toBeTruthy();
	} catch (e) {
		console.error(e);
		// console.log(JSON.stringify(mergedSession));
		fail();
	}
}

const testingFiles = '../../utils/test-utils/session-merger-test-files/';

function getSessions(name: string): { live: BT.Session, stored: BT.Session, expected: BT.Session } {
	const live: BT.Session = require(`${testingFiles}${name}/live-session.json`);
	const stored: BT.Session = require(`${testingFiles}${name}/stored-session.json`);
	const expected: BT.Session = require(`${testingFiles}${name}/expected-session.json`);
	return { live, stored, expected };
}
