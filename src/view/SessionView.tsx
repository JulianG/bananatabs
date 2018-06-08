import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

import Title from './Title';
import WindowListView from './WindowListView';
import TextSessionView from './TextSessionView';
import Footer from './Footer';


interface Props {
	version: string;
	session: BT.Session;
	sessionMutator: SessionMutator;
	windowMutator: WindowMutator;
	tabMutator: TabMutator;
}

interface State {
	textMode: boolean;
}

export default class SessionView extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = { textMode: false };
		this.changeToFullMode = this.changeToFullMode.bind(this);
		this.toggleMode = this.toggleMode.bind(this);
	}

	render() {

		return (
			<div>
				<Title onClick={this.toggleMode} />
				{this.renderSession()}
				<Footer version={this.props.version} />
			</div>
		);
	}

	renderSession() {
		const windows = this.props.session.windows;
		if (this.state.textMode === false) {
			return (
				<WindowListView
					windows={windows}
					sessionMutator={this.props.sessionMutator}
					windowMutator={this.props.windowMutator}
					tabMutator={this.props.tabMutator}
				/>
			);
		} else {
			return (
				<TextSessionView
					version={this.props.version}
					windows={windows}
					sessionMutator={this.props.sessionMutator}
					onClose={this.changeToFullMode}
				/>
			);
		}
	}

	private toggleMode() {
		this.setState((prevState: State) => {
			return { textMode: !prevState.textMode };
		});
	}

	private changeToFullMode() {
		this.setState({ textMode: false });
	}

}