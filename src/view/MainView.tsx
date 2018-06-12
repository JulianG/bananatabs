import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

import Title from './Title';
import WindowListView from './WindowListView';
import TextWindowView from './TextWindowView';
import NewWindowView from './NewWindowView';
import Footer from './Footer';

interface Props {
	version: string;
	session: BT.Session;
	sessionMutator: SessionMutator;
	windowMutator: WindowMutator;
	tabMutator: TabMutator;
}

interface State {
	mode: 'list' | 'read' | 'write';
	windowId: number;
}

export default class MainView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { mode: 'list', windowId: 0 };

		this.changeToWriteMode = this.changeToWriteMode.bind(this);
		this.changeToListMode = this.changeToListMode.bind(this);
		this.addWindowGroup = this.addWindowGroup.bind(this);
	}

	render() {

		return (
			<div>
				<Title />
				{this.renderSession()}
				<Footer version={this.props.version} />
			</div>
		);
	}

	renderSession() {
		const windows = this.props.session.windows;
		const mode = this.state.mode;
		return (
			<div>
				{mode === 'list' &&
					(
						<WindowListView
							windows={windows}
							sessionMutator={this.props.sessionMutator}
							windowMutator={this.props.windowMutator}
							tabMutator={this.props.tabMutator}
						/>
					)
				}
				{mode === 'list' &&
					(
						<button className="add" onClick={this.changeToWriteMode}>add links</button>
					)
				}
				{mode === 'read' &&
					(
						<TextWindowView
							window={windows.find(w => w.id === this.state.windowId)!}
							onClose={this.changeToListMode}
						/>
					)
				}
				{mode === 'write' &&
					(
						<NewWindowView
							minimumLines={10}
							onSave={this.addWindowGroup}
							onCancel={this.changeToListMode}
						/>
					)
				}
			</div>
		);
	}


	private changeToListMode() {
		this.setState({ mode: 'list' });
	}

	private changeToWriteMode() {
		this.setState({ mode: 'write' });
	}

	private addWindowGroup(windows: BT.Window[]) {
		console.log(`adding window:`);
		console.table(windows);
		this.props.sessionMutator.addWindows(windows);
		this.changeToListMode();
	}

}