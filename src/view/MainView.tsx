import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

import ClickCounter from './ClickCounter';

import { stringToWindows, windowsToString } from '../utils/MarkdownSerialisation';

import Title from './Title';
import WindowListView from './WindowListView';
import MainViewCmdButtons from './MainViewCmdButtons';
import TextWindowView from './TextWindowView';
import NewWindowView from './NewWindowView';
import Footer from './Footer';

interface Props {
	version: string;
	buildString: string;
	session: BT.Session;
	sessionMutator: SessionMutator;
	windowMutator: WindowMutator;
	tabMutator: TabMutator;
}

interface State {
	mode: 'list' | 'read' | 'write';
	windowId: number;
	debug: boolean;
}

export default class MainView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { mode: 'list', windowId: 0, debug: false };
		this.bindFunctions();
	}

	render() {

		return (
			<div>
				<ClickCounter onClick={this.handleClickCount}>
					<Title />
				</ClickCounter>
				{this.renderSession()}
				<Footer version={this.props.version} buildString={this.props.buildString} />
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
							debug={this.state.debug}
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
		this.props.sessionMutator.addWindows(windows);
		this.changeToListMode();
	}

	private changeToReadModeAllWindows() {
		this.changeToReadMode(-1);
	}

	private handleClickCount(count: number) {
		this.setState({ debug: count % 5 === 0 });
	}

	private bindFunctions() {
		// code-smell: too many bind(s)
		this.changeToListMode = this.changeToListMode.bind(this);
		this.changeToReadMode = this.changeToReadMode.bind(this);
		this.changeToWriteMode = this.changeToWriteMode.bind(this);
		this.changeToReadModeAllWindows = this.changeToReadModeAllWindows.bind(this);
		this.addWindowGroup = this.addWindowGroup.bind(this);
		this.handleClickCount = this.handleClickCount.bind(this);
	}

}