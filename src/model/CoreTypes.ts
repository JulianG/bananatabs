
export interface Session {
	windows: Window[];
	panelGeometry: Geometry;
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
	active: boolean;
	url: string;
}

export interface Geometry {
	top: number;
	left: number;
	width: number;
	height: number;
}