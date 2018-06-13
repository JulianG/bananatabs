import * as React from 'react';

const doNothing = () => { /**/ };

const Icons = {
	Copy: require('./icons/text.svg'),
	Edit: require('./icons/edit.svg'),
	Delete: require('./icons/delete.svg')
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

interface State {
	tooltip: string;
}

export default class TabToolsView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { tooltip: '' };
		this.handleRenameAction = this.handleRenameAction.bind(this);
		this.handleDeleteAction = this.handleDeleteAction.bind(this);
		this.handleCopyAction = this.handleCopyAction.bind(this);
		this.handleMouseOver = this.handleMouseOver.bind(this);
		this.resetToolTip = this.resetToolTip.bind(this);
	}

	render() {

		return (
			<div className="tab-tools" onMouseOut={this.resetToolTip}>
				<span className="tooltip">{this.state.tooltip}</span>&nbsp;
				{this.props.actionIconVisibility.copy &&
					<img
						id={'share'}
						title="Copy"
						className="icon"
						src={Icons.Copy}
						onClick={this.handleCopyAction}
						onMouseOver={this.handleMouseOver}
					/>
				}
				{this.props.actionIconVisibility.rename &&
					<img
						id={'rename'}
						title="Rename"
						className="icon"
						src={Icons.Edit}
						onClick={this.handleRenameAction}
						onMouseOver={this.handleMouseOver}
					/>}
				{this.props.actionIconVisibility.delete &&
					<img
						id={'delete'}
						title="Close and Delete"
						className="icon"
						src={Icons.Delete}
						onClick={this.handleDeleteAction}
						onMouseOver={this.handleMouseOver}
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

	private handleCopyAction(e: React.MouseEvent<HTMLImageElement>) {
		(this.props.onCopyAction || doNothing)();
	}

	private handleMouseOver(e: React.MouseEvent<HTMLImageElement>) {
		this.setState({tooltip: e.currentTarget.id});
	}

	private resetToolTip() {
		this.setState({tooltip: ''});
	}
}