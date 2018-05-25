import * as React from 'react';
import BananaFactory from '../factory/BananaFactory';
import SessionProvider from '../model/SessionProvider';
import SessionMutator, { DefaultSessionMutator } from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';
import WindowAndTabMutator from '../model/mutators/WindowAndTabMutator';
import * as BT from '../model/CoreTypes';
import WindowView from './WindowView';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';

interface Props {
	version: string;
}

interface State {
	session: BT.Session;
}

export default class SessionView extends React.Component<Props, State> {

	private sessionProvider: SessionProvider;
	private sessionMutator: SessionMutator;
	private windowMutator: WindowMutator;
	private tabMutator: TabMutator;

	constructor(props: Props) {
		super(props);

		const factory = new BananaFactory();

		this.sessionProvider = factory.getSessionProvider();
		this.sessionMutator = new DefaultSessionMutator(this.sessionProvider);
		this.tabMutator = this.windowMutator = new WindowAndTabMutator(this.sessionProvider, factory.getBrowserController());

		this.state = { session: this.sessionProvider.session };

		this.itemRenderer = this.itemRenderer.bind(this);

		this.printState = this.printState.bind(this);
		this.handleResizeEvent = this.handleResizeEvent.bind(this);
		this.onListUpdated = this.onListUpdated.bind(this);
	}

	componentDidMount() {

		window.addEventListener('resize', this.handleResizeEvent);

		this.sessionProvider.onSessionChanged = (session) => {
			this.setState({ session });
		};

		this.sessionProvider.initialiseSession('componentDidMount');
	}

	componentWillMount() {
		window.removeEventListener('resize', this.handleResizeEvent);
	}

	render() {
		const windows = this.state.session.windows;
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
		const windows = this.state.session.windows;
		return (
			<WindowView
				key={'window-' + i}
				window={windows[i]}
				windowMutator={this.windowMutator}
				tabMutator={this.tabMutator}
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

	private handleResizeEvent(e: UIEvent) {
		this.sessionProvider.updateSession('handleResizeEvent');
	}

	// private refreshWindowList(reason?: string) {
		// this.sessionProvider.initialiseSession('refreshWindowList ' + reason);
	// }

	private onListUpdated(items: BT.Window[]) {
		this.sessionMutator.updateWindows(items);
	}

	private printState() {
		console.log(localStorage.getItem('session'));
	}
}