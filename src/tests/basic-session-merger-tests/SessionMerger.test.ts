import * as BT from '../../model/CoreTypes';
import * as TestUtils from '../TestUtils';

import SessionMerger from '../../model/SessionMerger';

const merger = new SessionMerger();

test('when no windows visible. merged session is same as stored session', () => {

	const emptyLiveSession: BT.Session = require('./empty-live-session.json');
	const storedSession: BT.Session = require('./stored-session.json');
	const expectedMergedSession: BT.Session = require('./expected-merged-session.json');

	const mergedSession = merger.mergeSessions(emptyLiveSession, storedSession);
	expect(TestUtils.compareSessions(mergedSession, expectedMergedSession)).toBeTruthy();

});
