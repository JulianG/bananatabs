import * as React from 'react';
import * as BT from '../model/CoreTypes';
import TabToolsView from './TabToolsView';
import TabMutator from '../model/mutators/TabMutator';

const Icons = {
	On: require('../icons/on.png'),
	OnHidden: require('../icons/on-hidden.png'),
	Off: require('../icons/off.png'),
	Delete: require('../icons/delete.png'),
	Page: require('../icons/page.png'),
	Connection: require('../icons/connection.png')
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
		this.onToolsAction = this.onToolsAction.bind(this);
		this.state = { toolsVisible: false };
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

		const charLimit = 64;
		const title = (tab.title.length > charLimit) ? (tab.title.substring(0, charLimit) + '...') : tab.title;

		const visibilityIconSrc = tab.visible ? window.visible ? Icons.On : Icons.OnHidden : Icons.Off;

		const visibilityIconText = tab.visible ? 'Hide Tab' : 'Show Tab';
		return (
			<div
				className={styles.join(' ')}
				onMouseEnter={() => this.setState({ toolsVisible: true })}
				onMouseLeave={() => this.setState({ toolsVisible: false })}
			>
				<img className="icon" src={Icons.Connection} />

				<img
					className="tool icon"
					src={visibilityIconSrc}
					title={visibilityIconText}
					onClick={(e) => { this.onToolsAction('toggle-visibility'); }}
				/>

				<img className={iconStyles.join(' ')} src={icon} onDoubleClick={() => this.onToolsAction('selected')} />
				<span
					className="tab-title"
					onClick={() => this.onToolsAction('selected')}
				>
					{title}
				</span>
				{this.state.toolsVisible && <TabToolsView
					onAction={this.onToolsAction}
					itemVisible={tab.visible}
					actionIconVisibility={{ rename: false, visibility: false, delete: true }}
				/>}
			</div>
		);
	}

	private onToolsAction(action: string) {

		switch (action) {
			case 'toggle-visibility':
				this.props.mutator.toggleTabVisibility(this.props.window, this.props.tab);
				break;
			case 'delete':
				this.props.mutator.deleteTab(this.props.window, this.props.tab);
				break;
			case 'selected':
				this.props.mutator.selectTab(this.props.window, this.props.tab);
				break;
			default:
		}

	}

}