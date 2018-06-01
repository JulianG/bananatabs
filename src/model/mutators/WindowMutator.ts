
interface WindowMutator {
	renameWindow(id: number, title: string): void;
	collapseWindow(id: number): void;
	expandWindow(id: number): void;
	toggleWindowVisibility(id: number): void;
	hideWindow(id: number): void;
	showWindow(id: number): void;
	deleteWindow(id: number): void;
}

export default WindowMutator;