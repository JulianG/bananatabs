/* tslint:disable-next-line no-any */
export function makePromise<T>(funct: any, ...args: any[]): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		try {
			funct(...args, resolve);
		} catch (e) {
			reject(e);
		}
	});
}