import * as BT from './CoreTypes';
import SessionMerger from './SessionMerger';

const ZERO_GEOMETRY: BT.Geometry = { top: 0, left: 0, width: 0, height: 0 };
const EMPTY_SESSION: BT.Session = { windows: [], panelGeometry: ZERO_GEOMETRY };


export default class SessionProvider {

	public session: BT.Session;
	public onSessionChanged: (session: BT.Session) => void;

	private sessionMerger: SessionMerger;

	constructor() {
		this.session = EMPTY_SESSION;
		this.sessionMerger = new SessionMerger();

		this.initialiseSession = this.initialiseSession.bind(this);

		if (chrome && chrome.tabs) {
			chrome.tabs.onCreated.addListener(this.initialiseSession);
			chrome.tabs.onUpdated.addListener(this.initialiseSession);
			chrome.tabs.onActivated.addListener(this.initialiseSession);
			chrome.tabs.onMoved.addListener(this.initialiseSession);
			chrome.tabs.onActivated.addListener(this.initialiseSession);
			chrome.tabs.onHighlighted.addListener(this.initialiseSession);
			chrome.tabs.onDetached.addListener(this.initialiseSession);
			chrome.tabs.onAttached.addListener(this.initialiseSession);
			chrome.tabs.onRemoved.addListener(this.initialiseSession);
			chrome.tabs.onReplaced.addListener(this.initialiseSession);
		}
	}

	initialiseSession(): void {

		const convertWindow = this.convertWindow.bind(this);

		if (chrome && chrome.windows) {
			chrome.windows.getAll({ populate: true }, (windows: Array<chrome.windows.Window>) => {
				const windowsWithTabs = windows.filter(w => (w.tabs || []).length > 0);
				const session: BT.Session = { windows: windowsWithTabs.map(convertWindow), panelGeometry: ZERO_GEOMETRY };
				this.session = this.sessionMerger.mergeSessions(session, this.retrieveSession());
				this.storeSession(this.session);
				this.onSessionChanged(this.session);
			});
		} else {
			this.onSessionChanged(this.retrieveSession());
		}

	}

	//////////////////////////

	storeSession(session: BT.Session) {
		const serialisedSession = JSON.stringify(session);
		localStorage.setItem('session', serialisedSession);
	}

	private retrieveSession(): BT.Session {
		const serialisedSession: string = localStorage.getItem('session') || 'null';
		const session: BT.Session = JSON.parse(serialisedSession);
		if (session) {
			return session;
		} else {
			return EMPTY_SESSION;
		}
	}

	private convertWindow(w: chrome.windows.Window): BT.Window {

		return {
			id: w.id,
			title: '',
			visible: true,
			icon: '',
			tabs: (w.tabs || []).map(this.convertTab),
			focused: w.focused || false,
			type: w.type,
			state: w.state,
			geometry: this.getWindowGeometry(w),
			expanded: true
		};
	}

	private convertTab(t: chrome.tabs.Tab, i: number): BT.Tab {
		return {
			id: t.id || -1,
			title: t.title || '',
			visible: true,
			icon: t.favIconUrl || '',
			index: t.index,
			listIndex: i,
			url: t.url || '',
			active: t.active
		};
	}

	private getWindowGeometry(w: chrome.windows.Window): BT.Geometry {
		return { top: w.top || 0, left: w.left || 0, width: w.width || 0, height: w.height || 0 };
	}
}
