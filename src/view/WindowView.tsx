import * as React from 'react';
import * as BT from '../model/CoreTypes';
import TabView from './TabView';
import TabToolsView from './TabToolsView';
import InputForm from './InputForm';

import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

const Icons = {
	Edit: require('./icons/edit.svg'),
	On: require('./icons/on.svg'),
	Off: require('./icons/off.svg'),
	Delete: require('./icons/delete.svg'),
	ArrowDown: require('./icons/arrow-down.svg'),
	ArrowRight: require('./icons/arrow-right.svg')
};

interface Props {
	window: BT.Window;
	windowMutator: WindowMutator;
	tabMutator: TabMutator;
	debug?: boolean;
	onCopy(windowId: number): void;
}

interface State {
	toolsVisible: boolean;
	renaming: boolean;
}

export default class WindowView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { toolsVisible: false, renaming: false };

		this.handleStartRename = this.handleStartRename.bind(this);
		this.handleCancelRename = this.handleCancelRename.bind(this);
		this.handleSubmitRename = this.handleSubmitRename.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleCopy = this.handleCopy.bind(this);
		this.handleToggleVisibility = this.handleToggleVisibility.bind(this);
		this.handleToggleCollapse = this.handleToggleCollapse.bind(this);
		this.showTools = this.showTools.bind(this);
		this.hideTools = this.hideTools.bind(this);
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
		return (
			<div
				className="item-row"
				onMouseEnter={this.showTools}
				onMouseLeave={this.hideTools}
			>
				{this.renderDisclosureButton()}
				{this.renderVisibilityIcon()}
				{!this.state.renaming && this.renderTools()}
				{this.state.renaming ?
					this.renderInputTitle(w) :
					this.renderStaticTitle(w)}
				{this.state.renaming && <div className="hint">&nbsp;Enter to save&nbsp;</div>}
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
				onClick={this.handleToggleVisibility}
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
						debug={this.props.debug}
					/>
				);
			})
		);
	}

	private renderDisclosureButton() {
		const w = this.props.window;
		const iconSrc = w.expanded ? Icons.ArrowDown : Icons.ArrowRight;
		const iconText = w.expanded ? 'Collapse' : 'Expand';
		const iconStyles = ['tool', 'icon', w.visible ? '' : 'hidden'];
		return (
			<img
				className={iconStyles.join(' ')}
				src={iconSrc}
				title={iconText}
				onClick={this.handleToggleCollapse}
			/>
		);
	}

	private renderInputTitle(window: BT.Window): JSX.Element {

		const title = window.title;

		return (
			<InputForm
				className="window-title"
				text={title}
				onSubmit={this.handleSubmitRename}
				onCancel={this.handleCancelRename}
			/>
		);
	}

	private renderStaticTitle(window: BT.Window): JSX.Element {

		const tabsStr = window.expanded ? '' : ' (' + window.tabs.length + ' tabs)';
		const title = (this.props.debug ? `(${window.id}) ` : '') + (window.title || 'Window');
		const fullscreen = window.state === 'fullscreen' ? '(fullscreen)' : '';

		return (
			<span
				className="window-title"
				onClick={this.handleStartRename}
			>
				{title} <span>{tabsStr}</span> <span>{fullscreen}</span>
			</span>
		);
	}

	private renderTools() {
		if (this.state.toolsVisible) {
			return (
				<TabToolsView
					actionIconVisibility={{ rename: true, delete: true, copy: true }}
					onRenameAction={this.handleStartRename}
					onDeleteAction={this.handleDelete}
					onCopyAction={this.handleCopy}
				/>
			);
		} else {
			return null;
		}
	}

	////

	private handleCopy() {
		this.props.onCopy(this.props.window.id);
	}

	private handleToggleVisibility() {
		this.props.windowMutator.toggleWindowVisibility(this.props.window.id);
	}

	private handleDelete() {
		this.props.windowMutator.deleteWindow(this.props.window.id);
	}

	private handleStartRename() {
		this.setState({ renaming: true });
	}

	private handleCancelRename() {
		this.setState({ renaming: false });
	}

	private handleSubmitRename(text: string) {
		this.props.windowMutator.renameWindow(this.props.window.id, text);
		this.setState({ renaming: false });
	}

	private handleToggleCollapse() {
		if (this.props.window.expanded) {
			this.props.windowMutator.collapseWindow(this.props.window.id);
		} else {
			this.props.windowMutator.expandWindow(this.props.window.id);
		}
	}

	private showTools() {
		this.setState({ toolsVisible: true });
	}
	private hideTools() {
		this.setState({ toolsVisible: false });
	}

}
