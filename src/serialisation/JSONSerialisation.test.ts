import * as BT from '../model/CoreTypes';
import { compareSessions } from '../_test-utils/';

import { convertLegacySession } from './JSONSerialisation';

test('converted session is valid', () => {
  // given a legacy session
  const legacySession = require('./_test-files/legacy-session.json');

  // when converting it
  const convertedSession: BT.Session = convertLegacySession(legacySession);

  // expect the converted session compares to the legacy session
  expect(compareSessions(convertedSession, legacySession)).toBeTruthy();
});

test('conversion of legacy session: "geometry" => "bounds" ', () => {
  // given a legacy session
  const legacySession = require('./_test-files/legacy-session.json');

  // when converting it
  const convertedSession: BT.Session = convertLegacySession(legacySession);

  // expect the converted session has a  "bounds" for all windows
  // matching the "geometry" property from the legacy session windows
  expect(convertedSession.panelWindow.bounds).toEqual(
    legacySession.panelWindow.geometry
  );
  convertedSession.windows.forEach((convertedWindow, i) => {
    expect(convertedWindow.bounds).toEqual(legacySession.windows[i].geometry);
  });
});

test('conversion of current session: "bounds" => "bounds"', () => {
  // given a legacy session
  const currentSession = require('./_test-files/current-session.json');

  // when converting it
  const convertedSession: BT.Session = convertLegacySession(currentSession);

  // the converted session has bounds for all windows
  // matching the "bounds" property from the given session windows
  expect(convertedSession.panelWindow.bounds).toEqual(
    currentSession.panelWindow.bounds
  );
  convertedSession.windows.forEach((convertedWindow, i) => {
    expect(convertedWindow.bounds).toEqual(currentSession.windows[i].bounds);
  });
});
