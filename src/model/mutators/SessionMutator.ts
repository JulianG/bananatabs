import * as BT from '../CoreTypes';
// import WindowMutator from './WindowMutator';
// import TabMutator from './TabMutator';
import SessionProvider from '../SessionProvider';

interface WindowSortingFunction {
	(a: BT.Window, b: BT.Window): number;
}

interface SessionMutator {
	sortWindows(f: WindowSortingFunction): void;
	updateWindows(windows: BT.Window[]): void;
}

export default SessionMutator;

export class DefaultSessionMutator {

	constructor(private provider: SessionProvider) {
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

	///

	private updateSession() {
		this.provider.storeSession(this.provider.session);
		this.provider.onSessionChanged(this.provider.session);
	}



}