import * as BT from '../model/CoreTypes';

export const printSession = (session: BT.Session) => {
	console.table(session.windows.map(w => {
		return {
			id: w.id,
			title: w.title,
			visible: w.visible,
			tabs: w.tabs.length
		};
	}));
};