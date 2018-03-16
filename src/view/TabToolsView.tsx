import * as React from 'react';

const Icons = {
	Edit: require('../icons/edit.png'),
	On: require('../icons/on.png'),
	Off: require('../icons/off.png'),
	Delete: require('../icons/delete.png')
};

interface Props {
	itemVisible: boolean;
	actionIconVisibility: {
		rename: boolean;
		visibility: boolean;
		delete: boolean;
	};
	onAction(action: string): void;
}

export default class TabToolsView extends React.Component<Props, {}> {

	render() {

		const visibilityIcon = this.props.itemVisible ? Icons.On : Icons.Off;

		return (
			<div className="tab-tools">
				{this.props.actionIconVisibility.rename &&
					<img
						title="Rename"
						className="icon"
						src={Icons.Edit}
						onClick={(e) => { this.props.onAction('start-rename'); }}
					/>}
				{this.props.actionIconVisibility.visibility &&
					<img
						title="Show/Hide"
						className="icon"
						src={visibilityIcon}
						onClick={(e) => { this.props.onAction('toggle-visibility'); }}
					/>}
				{this.props.actionIconVisibility.delete &&
					<img
						title="Close and Delete"
						className="icon"
						src={Icons.Delete}
						onClick={(e) => { this.props.onAction('delete'); }}
					/>}
			</div>
		);
	}
}