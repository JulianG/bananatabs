
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
	bounds: Rectangle;
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

export interface Rectangle {
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
	bounds: { top: 0, left: 0, width: 0, height: 0 },
	type: 'normal',
	state: 'normal',
	tabs: [],
	expanded: false
};

export const NullTab: Tab = {
	id: 0,
	title: 'Null Tab',
	icon: '',
	visible: false,
	active: false,
	url: '',
	listIndex: 0,
	index: 0
};

export const EmptySession: Session = { windows: [], panelWindow: NullWindow };

export interface DisplayInfo {
	id: string;
	name: string;
	bounds: Rectangle;
	workArea: Rectangle;
}