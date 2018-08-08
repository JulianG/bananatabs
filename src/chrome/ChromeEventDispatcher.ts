
import console from '../utils/MutedConsole';
import { BrowserEventListener } from '../model/mutators/BrowserEventDispatcher';

export class ChromeEventDispatcher {

	private eventListeners: BrowserEventListener[];

	constructor() {

		this.eventListeners = [];		
	}

	public addListener(listener: BrowserEventListener): void {
		this.eventListeners.push(listener);
	}

	public removeListener(listener: BrowserEventListener): void {
		const index = this.eventListeners.indexOf(listener);
		if (index >= 0) {
			this.eventListeners.splice(index, 1);
		} else {
			throw (new Error('Cannot remove EventListener'));
		}
	}

	////

	public dispatchEvent(event: string, reason?: string) {
		console.log(`${event} event dispatched`);
		this.eventListeners.forEach(listener => listener(event, reason || event));
	}


}