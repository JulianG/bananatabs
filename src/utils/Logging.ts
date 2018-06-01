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

export const printSessionDetailed = (session: BT.Session) => {
	session.windows.filter(w => w.visible).forEach(w => {
		console.log(`Window id: ${w.id}, ${w.title}`);
		console.table(w.tabs.map(t => {
			return {
				id: t.id,
				title: t.title,
				active: t.active ? 'active' : '',
				visible: t.visible ? 'visible' : ''
			};
		}));

	});
};