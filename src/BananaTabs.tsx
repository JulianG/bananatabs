import * as React from 'react';
import * as BT from './model/core/CoreTypes';
import { BananaContext } from './context/BananaContext';
import { MainView } from './view/MainView';

const MANIFEST = require('./manifest.lnk.json');

interface Props {
  context: BananaContext;
}

interface State {
  session: BT.Session;
}

export class BananaTabs extends React.Component<Props, State> {
  readonly state: State = { session: BT.EmptySession };
  private version: string;
  private buildString: string;

  constructor(props: Props) {
    super(props);
    console.assert(
      MANIFEST.version !== undefined,
      'manifest.json must contain a "version" key.'
    );
    this.version = MANIFEST.version || '0.0';
    this.buildString = '';
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return this.state.session !== nextState.session;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeEvent.bind(this));
    this.props.context.sessionProvider.onSessionChanged = session => {
      this.setState({ session });
    };
    this.props.context.sessionProvider.initialiseSession();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeEvent);
    this.props.context.sessionProvider.onSessionChanged = session => {
      // console.warn(
      //   'BananaTabs.componentWillUnmount -> sessionProvider.onSessionChanged'
      // );
    };
  }

  render() {
    return (
      <MainView
        version={this.version}
        buildString={this.buildString}
        session={this.state.session}
        sessionMutator={this.props.context.sessionMutator}
        windowMutator={this.props.context.windowMutator}
        tabMutator={this.props.context.tabMutator}
      />
    );
  }

  private handleResizeEvent(e: UIEvent) {
    this.props.context.sessionProvider.updateSession();
  }
}
