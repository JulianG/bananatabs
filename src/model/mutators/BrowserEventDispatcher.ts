
export interface BrowserEventListener {
	(event: string, reason?: string): void;
}

export interface BrowserEventDispatcher {
	addListener(listener: BrowserEventListener): void;
	removeListener(listener: BrowserEventListener): void;
	enable(): void;
	disable(): void;
}
