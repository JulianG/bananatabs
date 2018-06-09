import * as BT from '../CoreTypes';
import SessionProvider from '../SessionProvider';
import TextSessionMerger from '../mergers/TextSessionMerger';

interface WindowSortingFunction {
	(a: BT.Window, b: BT.Window): number;
}

interface SessionMutator {
	sortWindows(f: WindowSortingFunction): void;
	updateWindows(windows: BT.Window[]): void;
	mergeWithWindows(windows: BT.Window[]): void;
}

export default SessionMutator;

export class DefaultSessionMutator {

	constructor(private provider: SessionProvider, private sessionMerger: TextSessionMerger) {
	}

	sortWindows(f: WindowSortingFunction): void {
		const session = this.provider.session;
		session.windows = session.windows.sort(f);
		this.updateSession();
	}

	updateWindows(windows: BT.Window[]): void {
		const session = this.provider.session;
		session.windows = windows;
		this.updateSession();
	}

	mergeWithWindows(windows: BT.Window[]): void {
		this.provider.session.windows = this.sessionMerger.merge(windows, this.provider.session.windows);
		this.updateSession();
	}

	///

	private updateSession() {
		this.provider.storeSession(this.provider.session);
		this.provider.onSessionChanged(this.provider.session);
	}



}