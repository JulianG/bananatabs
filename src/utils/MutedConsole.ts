/*
tslint:disable no-any
tslint:disable no-empty
*/

class MutedConsole implements Console {

	memory: any;
	Console: NodeJS.ConsoleConstructor;
	assert(test?: boolean, message?: string, ...optionalParams: any[]): void { }
	clear(): void { }
	countReset(): void { }
	count(countTitle?: string): void { }
	debug(message?: any, ...optionalParams: any[]): void { }
	dir(value?: any, ...optionalParams: any[]): void { }
	dirxml(value: any): void { }
	error(message?: any, ...optionalParams: any[]): void { }
	exception(message?: string, ...optionalParams: any[]): void { }
	group(groupTitle?: string, ...optionalParams: any[]): void { }
	groupCollapsed(groupTitle?: string, ...optionalParams: any[]): void { }
	groupEnd(): void { }
	info(message?: any, ...optionalParams: any[]): void { }
	log(message?: any, ...optionalParams: any[]): void { }
	markTimeline(label?: string): void { }
	msIsIndependentlyComposed(element: Element): boolean { return false; }
	profile(reportName?: string): void { }
	profileEnd(): void { }
	select(element: Element): void { }
	table(...data: any[]): void { }
	time(timerName?: string): void { }
	timeEnd(timerName?: string): void { }
	timeStamp(label?: string): void { }
	timeline(label?: string): void { }
	timelineEnd(label?: string): void { }
	trace(message?: any, ...optionalParams: any[]): void { }
	warn(message?: any, ...optionalParams: any[]): void { }
}

const mutedConsole = new MutedConsole();
export default mutedConsole;

console.log('Using MutedConsole');