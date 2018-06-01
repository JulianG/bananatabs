import * as React from 'react';
import * as BT from '../model/CoreTypes';
import TabToolsView from './TabToolsView';
import TabMutator from '../model/mutators/TabMutator';

const Icons = {
	On: require('../icons/on.svg'),
	OnHidden: require('../icons/on-hidden.svg'),
	Off: require('../icons/off.svg'),
	Delete: require('../icons/delete.svg'),
	Page: require('../icons/page.svg')
};

interface Props {
	window: BT.Window;
	tab: BT.Tab;
	mutator: TabMutator;
}

interface State {
	toolsVisible: boolean;
}

export default class TabView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);

		this.state = { toolsVisible: false };

		this.onSelectAction = this.onSelectAction.bind(this);
		this.onDeleteAction = this.onDeleteAction.bind(this);
		this.onToggleVisibilityAction = this.onToggleVisibilityAction.bind(this);
		this.showTools = this.showTools.bind(this);
		this.hideTools = this.hideTools.bind(this);
	}

	render() {

		const window = this.props.window;
		const tab = this.props.tab;

		const styles = [
			'item-row',
			'tab', tab.active ? 'active' : '',
			this.state.toolsVisible ? 'highlight' : '',
			tab.visible ? 'visible' : 'hidden'
		];

		const icon = tab.icon || Icons.Page;

		const iconStyles = [
			'icon',
			(tab.visible && window.visible) ? '' : 'hidden'
		];

		const title = tab.title;
		const visibilityIconSrc = tab.visible ? window.visible ? Icons.On : Icons.OnHidden : Icons.Off;
		const visibilityIconText = tab.visible ? 'Hide Tab' : 'Show Tab';

		return (
			<div
				className={styles.join(' ')}
				onMouseEnter={this.showTools}
				onMouseLeave={this.hideTools}
			>
				<img
					className="left-most tool icon"
					src={visibilityIconSrc}
					title={visibilityIconText}
					onClick={this.onToggleVisibilityAction}
				/>

				<img
					className={iconStyles.join(' ')}
					src={icon}
					onClick={this.onSelectAction}
				/>
				{this.state.toolsVisible && <TabToolsView
					actionIconVisibility={{ rename: false, delete: true }}
					onDeleteAction={this.onDeleteAction}
				/>}
				<span
					className="tab-title"
					onClick={this.onSelectAction}
				>
					{title}
				</span>
			</div>
		);
	}

	private onSelectAction() {
		this.props.mutator.selectTab(this.props.window.id, this.props.tab.id);
	}

	private onToggleVisibilityAction() {
		this.props.mutator.toggleTabVisibility(this.props.window.id, this.props.tab.id);
	}

	private onDeleteAction() {
		this.props.mutator.deleteTab(this.props.window.id, this.props.tab.id);
	}

	private showTools() {
		this.setState({ toolsVisible: true });
	}
	private hideTools() {
		this.setState({ toolsVisible: false });
	}

}