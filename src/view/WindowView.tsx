import * as React from 'react';
import * as BT from '../model/CoreTypes';
import TabView from './TabView';
import TabToolsView from './TabToolsView';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

const Icons = {
	Edit: require('../icons/edit.png'),
	On: require('../icons/on.png'),
	Off: require('../icons/off.png'),
	Delete: require('../icons/delete.png'),
	ArrowDown: require('../icons/arrow-down.png'),
	ArrowRight: require('../icons/arrow-right.png')
};

interface Props {
	window: BT.Window;
	windowMutator: WindowMutator;
	tabMutator: TabMutator;
}

interface State {
	toolsVisible: boolean;
	renaming: boolean;
	tempTitle: string;
}

export default class WindowView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { toolsVisible: false, renaming: false, tempTitle: props.window.title };

		this.onToolsAction = this.onToolsAction.bind(this);
		this.onToolsAction = this.onToolsAction.bind(this);
	}

	render() {

		const w = this.props.window;

		const styles = [
			'window-group',
			w.focused ? 'focused' : '',
			this.state.toolsVisible ? 'highlight' : '',
			w.visible ? 'visible' : 'hidden'
		];

		return (
			<div className={styles.join(' ')}>
				{this.renderHeader()}
				{this.renderTabs()}
			</div>
		);
	}

	private renderHeader() {
		const w = this.props.window;
		const title = w.title || 'Window';
		return (
			<div
				className="item-row"
				onMouseEnter={() => this.setState({ toolsVisible: true })}
				onMouseLeave={() => this.setState({ toolsVisible: false })}
			>
				{this.renderWindowIcon()}
				{this.renderVisibilityIcon()}
				{this.state.renaming ?
					this.renderInputTitle(title) :
					this.renderStaticTitle(title)}
				{this.renderTools()}
			</div>
		);
	}

	private renderVisibilityIcon() {
		const w = this.props.window;
		const visibilityIconSrc = w.visible ? Icons.On : Icons.Off;
		const visibilityIconText = w.visible ? 'Hide Window' : 'Show Window';
		return (
			<img
				className="tool icon"
				src={visibilityIconSrc}
				title={visibilityIconText}
				onClick={(e) => { this.onToolsAction('toggle-visibility'); }}
			/>
		);
	}

	private renderTabs() {
		const w = this.props.window;
		return (
			w.expanded && w.tabs.map((tab, i) => {
				return (
					<TabView
						key={'tab-' + i}
						window={this.props.window}
						tab={tab}
						mutator={this.props.tabMutator}
					/>
				);
			})
		);
	}

	private renderWindowIcon() {
		const w = this.props.window;
		const iconSrc = w.expanded ? Icons.ArrowDown : Icons.ArrowRight;
		const iconText = w.expanded ? 'Collapse' : 'Expand';
		const iconStyles = ['expand-collapse-icon', 'icon', w.visible ? '' : 'hidden'];
		return (
			<img
				className={iconStyles.join(' ')}
				src={iconSrc}
				title={iconText}
				onClick={() => { this.onToolsAction('toggle-collapse'); }}
			/>
		);
	}

	private renderInputTitle(title: string): JSX.Element {
		return (
			<input
				autoFocus={true}
				type="text"
				defaultValue={title}
				onChange={(event) => {
					this.setState({ tempTitle: event.target.value });
				}}
				onKeyUp={(event) => {
					if (event.keyCode === 13) {
						this.props.windowMutator.renameItem(this.props.window, this.state.tempTitle);
						this.setState({ renaming: false });
					}
				}}
				onBlur={(event) => {
					this.props.windowMutator.renameItem(this.props.window, this.state.tempTitle);
					this.setState({ renaming: false });
				}}
			/>
		);
	}

	private renderStaticTitle(title: string): JSX.Element {
		return (
			<span
				className="window-title"
				onDoubleClick={(event) => {
					this.onToolsAction('start-rename');
				}}
			>
				{title}
			</span>
		);
	}

	private renderTools() {
		if (this.state.toolsVisible) {
			const w = this.props.window;
			return (
				<TabToolsView
					onAction={this.onToolsAction}
					itemVisible={w.visible}
					actionIconVisibility={{ rename: true, visibility: false, delete: true }}
				/>
			);
		} else {
			return null;
		}
	}

	////

	private onToolsAction(action: string) {

		const window = this.props.window;
		const windowMutator = this.props.windowMutator;

		switch (action) {
			case 'toggle-visibility':
				windowMutator.toggleVisibility(window);
				break;
			case 'delete':
				windowMutator.deleteWindow(window);
				break;
			case 'start-rename':
				this.setState({ renaming: true });
				break;
			case 'toggle-collapse':
				if (this.props.window.expanded) {
					this.props.windowMutator.collapseWindow(this.props.window);
				} else {
					this.props.windowMutator.expandWindow(this.props.window);
				}
				break;
			default:

		}
	}

}
