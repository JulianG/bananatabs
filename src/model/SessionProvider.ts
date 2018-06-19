import * as BT from './CoreTypes';

export default interface SessionProvider {
	session: BT.Session;
	onSessionChanged(session: BT.Session): void;
	initialiseSession(reason?: string): Promise<void>;
	updateSession(reason?: string): Promise<void>;
	storeSession(session: BT.Session): Promise<void>;

	getWindow(id: number): BT.Window;
	getTab(id: number): BT.Tab;
	
	// enableBrowserEvents(): void;
	// disableBrowserEvents(): void;

}