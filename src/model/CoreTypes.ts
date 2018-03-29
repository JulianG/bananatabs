
export interface Session {
	windows: Window[];
	panelWindow: Window;
}

export interface ListItem {
	title: string;
	visible: boolean;
	icon: string;
}

export interface Window extends ListItem {

	id: number;
	focused: boolean;
	geometry: Geometry;
	type: string;
	state: string;
	tabs: Tab[];
	expanded: boolean;
}

export interface Tab extends ListItem {

	id: number;
	index: number;
	listIndex: number;
	active: boolean;
	url: string;
}

export interface Geometry {
	top: number;
	left: number;
	width: number;
	height: number;
}

export const NullWindow: Window = {
	id: 0,
	icon: '',
	title: '',
	visible: false,
	focused: false,
	geometry: { top: 0, left: 0, width: 0, height: 0 },
	type: '',
	state: '',
	tabs: [],
	expanded: false
};

export const EmptySession: Session = { windows: [], panelWindow: NullWindow };