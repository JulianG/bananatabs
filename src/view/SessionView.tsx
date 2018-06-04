import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

import WindowView from './WindowView';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';

interface Props {
	version: string;
	session: BT.Session;
	sessionMutator: SessionMutator;
	windowMutator: WindowMutator;
	tabMutator: TabMutator;
}

export default class SessionView extends React.Component<Props, {}> {

	constructor(props: Props) {
		super(props);
		this.itemRenderer = this.itemRenderer.bind(this);
		this.printState = this.printState.bind(this);
		this.onListUpdated = this.onListUpdated.bind(this);
	}

	render() {
		const windows = this.props.session.windows;
		return (
			<div>
				<h3>
					<img className="app-icon" src="/icons/app-icon.png" onClick={this.printState} /><span>Banana Tabs!</span>&nbsp;
					<div style={{ display: 'inline' }} className="credits">BETA</div>
				</h3>
				<RLDD
					cssClasses="session"
					items={windows}
					layout={'vertical'}
					threshold={25}
					dragDelay={250}
					onChange={this.onListUpdated}
					itemRenderer={this.itemRenderer}
				/>
				{this.renderCredits()}
			</div>
		);
	}

	private itemRenderer(item: BT.Window, i: number) {
		const windows = this.props.session.windows;
		return (
			<WindowView
				key={'window-' + i}
				window={windows[i]}
				windowMutator={this.props.windowMutator}
				tabMutator={this.props.tabMutator}
			/>
		);
	}

	private renderCredits() {
		return (
			<div className="credits">
				<p><strong>BananaTabs! v{this.props.version}</strong><br />
					Developed by Julian Garamendy.<br />
					Icons designed by Dave Gandy from&nbsp;
					<a href="https://www.flaticon.com/packs/font-awesome" target="_blank">FlatIcon</a>. -
					Banana icon by Freepik from&nbsp;
					<a href="https://www.flaticon.com/free-icon/banana_688828" target="_blank">FlatIcon</a>.</p>
			</div>
		);
	}

	private onListUpdated(items: BT.Window[]) {
		this.props.sessionMutator.updateWindows(items);
	}

	private printState() {
		console.log(localStorage.getItem('session'));
	}
}