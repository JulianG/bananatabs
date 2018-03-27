import * as React from 'react';
import SessionProvider from '../model/SessionProvider';
import SessionMutator, { DefaultSessionMutator } from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';
import ChromeWindowAndTabMutator from '../model/mutators/ChromeWindowAndTabMutator';
import * as BT from '../model/CoreTypes';
import WindowView from './WindowView';
import DLContext from '../draggable-list/DLContext';

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

		this.sessionProvider = new SessionProvider();
		this.sessionMutator = new DefaultSessionMutator(this.sessionProvider);

		this.tabMutator = this.windowMutator = new ChromeWindowAndTabMutator(this.sessionProvider);

		this.state = { session: this.sessionProvider.session };

		this.refreshWindowList = this.refreshWindowList.bind(this);
		this.onListUpdated = this.onListUpdated.bind(this);

	}

	componentDidMount() {

		window.addEventListener('focus', this.refreshWindowList);
		window.addEventListener('resize', this.refreshWindowList);

		this.sessionProvider.onSessionChanged = (session) => {
			this.setState({ session });
		};

		this.refreshWindowList();
	}

	componentWillMount() {
		window.removeEventListener('focus', this.refreshWindowList);
		window.removeEventListener('resize', this.refreshWindowList);
	}

	render() {
		const windows = this.state.session.windows;
		return (
			<div>
				<h3>
					<img className="app-icon" src="/icons/app-icon.png" /><span>Banana Tabs!</span>&nbsp;
					<div style={{ display: 'inline' }} className="credits">BETA</div>
				</h3>
				<DLContext
					cssClasses="session"
					items={windows}
					layout={'vertical'}
					threshold={25}
					onChange={this.onListUpdated}
					/* tslint:disable-next-line jsx-no-lambda */
					itemRenderer={(i: number) => {
						return <WindowView
							key={'window-' + i}
							window={windows[i]}
							windowMutator={this.windowMutator}
							tabMutator={this.tabMutator}
						/>;
					}}
				/>
				{this.renderCredits()}
			</div>
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

	private refreshWindowList() {
		this.sessionProvider.initialiseSession();
	}
	private onListUpdated(items: BT.Window[]) {
		this.sessionMutator.updateWindows(items);
	}

}