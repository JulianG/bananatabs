import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

import { stringToWindows, windowsToString } from '../utils/MarkdownSerialisation';

import Title from './Title';
import WindowListView from './WindowListView';
import MainViewCmdButtons from './MainViewCmdButtons';
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

		this.changeToListMode = this.changeToListMode.bind(this);
		this.changeToReadMode = this.changeToReadMode.bind(this);
		this.changeToWriteMode = this.changeToWriteMode.bind(this);
		this.changeToReadModeAllWindows = this.changeToReadModeAllWindows.bind(this);
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
							onWindowCopied={this.changeToReadMode}
						/>
					)
				}
				{mode === 'list' &&
					(
						<MainViewCmdButtons
							onPaste={this.changeToWriteMode}
							onCopyAll={this.changeToReadModeAllWindows}
						/>
					)
				}
				{mode === 'read' &&
					(
						<TextWindowView
							windows={windows.filter(w => {
								return this.state.windowId === -1 ||
									w.id === this.state.windowId;
							})}
							windowsToString={windowsToString}
							onClose={this.changeToListMode}
						/>
					)
				}
				{mode === 'write' &&
					(
						<NewWindowView
							minimumLines={10}
							stringToWindows={stringToWindows}
							onSave={this.addWindowGroup}
							onClose={this.changeToListMode}
						/>
					)
				}
			</div>
		);
	}

	private changeToListMode() {
		this.setState({ mode: 'list' });
	}

	private changeToReadMode(windowId: number) {
		this.setState({ mode: 'read', windowId });
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

	private changeToReadModeAllWindows() {
		this.changeToReadMode(-1);
	}

}