import * as React from 'react';

import * as BT from './model/core/CoreTypes';
import { BananaFactory } from './factory/BananaFactory';
import { SessionProvider } from './model/SessionProvider';
import { SessionMutator } from './model/mutators/SessionMutator';
import { WindowMutator } from './model/mutators/WindowMutator';
import { TabMutator } from './model/mutators/TabMutator';
import { WindowAndTabMutator } from './model/mutators/WindowAndTabMutator';
import { MainView } from './view/MainView';

const MANIFEST = require('./manifest.lnk.json');

interface Props {
  factory: BananaFactory;
}

interface State {
  session: BT.Session;
}

export class BananaTabs extends React.Component<Props, State> {
  readonly state: State = { session: BT.EmptySession };
  private version: string;
  private buildString: string;

  private sessionProvider: SessionProvider;
  private sessionMutator: SessionMutator;
  private windowMutator: WindowMutator;
  private tabMutator: TabMutator;

  constructor(props: Props) {
    super(props);
    console.assert(
      MANIFEST.version !== undefined,
      'manifest.json must contain a "version" key.'
    );
    this.version = MANIFEST.version || '0.0';
    this.buildString = '';

    const factory = props.factory;

    this.sessionMutator = factory.sessionMutator;
    this.sessionProvider = factory.sessionProvider;
    const mutator = new WindowAndTabMutator(
      this.sessionProvider,
      factory.browserController
    );
    this.tabMutator = this.windowMutator = mutator;
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return this.state.session !== nextState.session;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeEvent.bind(this));
    this.sessionProvider.onSessionChanged = session => {
      this.setState({ session });
    };
    this.sessionProvider.initialiseSession();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeEvent);
    this.sessionProvider.onSessionChanged = session => {
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
        sessionMutator={this.sessionMutator}
        windowMutator={this.windowMutator}
        tabMutator={this.tabMutator}
      />
    );
  }

  private handleResizeEvent(e: UIEvent) {
    this.sessionProvider.updateSession();
  }
}
