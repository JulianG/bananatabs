// Some declarations that we need 
// but are missing in @types/chrome v0.0.69

declare namespace chrome.system.display {

	export interface DisplayUnitInfo {
		id: string;
		name: string;
		isPrimary: boolean;
		isEnabled: boolean;
		bounds: Bounds;
		workArea: Bounds;
	}

	export interface Bounds {
		left: number;
		top: number;
		width: number;
		height: number;
	}

	export function getInfo(options: {}, callback: (info: DisplayUnitInfo[]) => void): void;
}