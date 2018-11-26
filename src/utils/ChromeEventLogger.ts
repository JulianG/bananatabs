/*
This script can be used to understand the order of events triggered by the chrome API.
*/
export default class ChromeEventLogger {

	constructor() {

		this.clearLog();
		this.log( new Date().toLocaleTimeString() );

		if (chrome && chrome.tabs) {
			chrome.windows.onCreated.addListener((w) => {
				const event = this.decorateEventName('chrome.windows.onCreated');
				this.log(event);
				this.log(JSON.stringify(w, null, 2));
				this.logState(event);
			});
			chrome.tabs.onUpdated.addListener((id, info) => {
				const event = this.decorateEventName('chrome.tabs.onUpdated');
				this.log(event);
				this.log('id:' + id);
				this.log(JSON.stringify(info, null, 2));
				this.logState(event);
			});
			chrome.windows.onRemoved.addListener((id) => {
				const event = this.decorateEventName('chrome.windows.onRemoved');
				this.log(event);
				this.log('id:' + id);
				this.logState(event);
			});
			chrome.windows.onFocusChanged.addListener((id) => {
				const event = this.decorateEventName('chrome.windows.onFocusChanged');
				this.log(event);
				this.log('id:' + id);
				this.logState(event);
			});
			chrome.tabs.onCreated.addListener((tab) => {
				const event = this.decorateEventName('chrome.tabs.onCreated');
				this.log(event);
				this.log(JSON.stringify(tab, null, 2));
				this.logState(event);
			});
			chrome.tabs.onMoved.addListener((id) => {
				const event = this.decorateEventName('chrome.tabs.onMoved');
				this.log(event);
				this.log('id:' + id);
				this.logState(event);
			});
			chrome.tabs.onAttached.addListener((id, info) => {
				const event = this.decorateEventName('chrome.tabs.onAttached');
				this.log(event);
				this.log('id:' + id);
				this.log(JSON.stringify(info, null, 2));
				this.logState(event);
			});
			chrome.tabs.onRemoved.addListener((id) => {
				const event = this.decorateEventName('chrome.tabs.onRemoved');
				this.log(event);
				this.log('id:' + id);
				this.logState(event);
			});
			chrome.tabs.onActivated.addListener((info) => {
				const event = this.decorateEventName('chrome.tabs.onActivated');
				this.log(event);
				this.log(JSON.stringify(info, null, 2));
				this.logState(event);
			});
			chrome.tabs.onHighlighted.addListener((info) => {
				const event = this.decorateEventName('chrome.tabs.onHighlighted');
				this.log(event);
				this.log(JSON.stringify(info, null, 2));
				this.logState(event);
			});
			chrome.tabs.onDetached.addListener((id) => {
				const event = this.decorateEventName('chrome.tabs.onDetached');
				this.log(event);
				this.log('id:' + id);
				this.logState(event);
			});
			chrome.tabs.onReplaced.addListener((id) => {
				const event = this.decorateEventName('chrome.tabs.onReplaced');
				this.log(event);
				this.log('id:' + id);
				this.logState(event);
			});
			chrome.tabs.onZoomChange.addListener((info) => {
				const event = this.decorateEventName('chrome.tabs.onZoomChange');
				this.log(event);
				this.log(JSON.stringify(info, null, 2));
				this.logState(event);
			});
		} else {
			console.warn('Cannot initialise ChromeEventLogger.');
		}
	}

	private decorateEventName(name: string): string {
		return name + ' - ' + Math.random();
	}

	private logState(reason: string) {
		// chrome.windows.getAll({ populate: true }, (windows) => {
		// 	this.log(`getAll for: (${reason})`);
		// 	const ws = windows.map(w => {
		// 		return {
		// 			id: w.id,
		// 			focused: w.focused,
		// 			width: w.width,
		// 			height: w.height,
		// 			top: w.top,
		// 			left: w.left,
		// 			state: w.state,
		// 			type: w.type,
		// 			tabs: (w.tabs || []).map(t => {
		// 				return {
		// 					id: t.id,
		// 					index: t.index,
		// 					active: t.active,
		// 					selected: t.selected,
		// 					highlighted: t.highlighted,
		// 					status: t.status,
		// 					title: t.title,
		// 					url: t.url,
		// 					favIconUrl: t.favIconUrl,
		// 					windowId: t.windowId
		// 				};
		// 			})
		// 		};
		// 	});
		// 	this.log(JSON.stringify(ws, null, 2));
		// });
	}

	private clearLog() {
		localStorage.setItem('chrome_event_logger', '');
	}
	private log(msg: string) {
		console.log(msg);
		let log: string = localStorage.getItem('chrome_event_logger') || '';
		log = log + msg + '\n';
		localStorage.setItem('chrome_event_logger', log);
	}
}