/*
tslint:disable no-any
*/
interface T extends Function {}

export default class FakeChromeEvent<S extends T> implements chrome.events.Event<T> {

	private list: T[];

	fakeDispatch(...args: any[]) {

		this.list.forEach( cb => {
			cb(...args);
		});
	}
	
	getRules() {
		return [];
	}

	addListener(callback: T) {
		this.list.push(callback);
	}

	hasListener(callback: T) {
		return this.list.findIndex(c => c === callback) > -1;
	}

	removeListener(callback: T) {
		const index = this.list.findIndex(c => c === callback);
		if (index > -1) {
			this.list.splice(index, 1);
		}
	}

	removeRules() {
		/* */
	}

	addRules(_: any[]) {
		/* */
	}

	hasListeners() {
		return this.list.length > 0;
	}

}
