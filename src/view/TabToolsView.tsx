import * as React from 'react';

const doNothing = () => { /**/ };

const Icons = {
	Edit: require('../icons/edit.svg'),
	Delete: require('../icons/delete.svg')
};

interface Props {
	actionIconVisibility: {
		copy: boolean;
		rename: boolean;
		delete: boolean;
	};
	onRenameAction?(): void;
	onDeleteAction?(): void;
	onCopyAction?(): void;
}

export default class TabToolsView extends React.Component<Props, {}> {

	constructor(props: Props) {
		super(props);
		this.handleRenameAction = this.handleRenameAction.bind(this);
		this.handleDeleteAction = this.handleDeleteAction.bind(this);
		this.handleCopyAction = this.handleCopyAction.bind(this);
	}

	render() {

		return (
			<div className="tab-tools">
				{this.props.actionIconVisibility.copy &&
					<a onClick={this.handleCopyAction}>copy
					</a>
				}
				{this.props.actionIconVisibility.rename &&
					<img
						title="Rename"
						className="icon"
						src={Icons.Edit}
						onClick={this.handleRenameAction}
					/>}
				{this.props.actionIconVisibility.delete &&
					<img
						title="Close and Delete"
						className="icon"
						src={Icons.Delete}
						onClick={this.handleDeleteAction}
					/>}
			</div>
		);
	}

	private handleRenameAction(e: React.MouseEvent<HTMLImageElement>) {
		(this.props.onRenameAction || doNothing)();
	}

	private handleDeleteAction(e: React.MouseEvent<HTMLImageElement>) {
		(this.props.onDeleteAction || doNothing)();
	}

	private handleCopyAction(e: React.MouseEvent<HTMLElement>) {
		(this.props.onCopyAction || doNothing)();
	}
}