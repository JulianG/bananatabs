import * as React from 'react';

import * as BT from './model/CoreTypes';
import BananaFactory from './factory/BananaFactory';
import SessionProvider from './model/SessionProvider';
import SessionMutator, { DefaultSessionMutator } from './model/mutators/SessionMutator';
import WindowMutator from './model/mutators/WindowMutator';
import TabMutator from './model/mutators/TabMutator';
import WindowAndTabMutator from './model/mutators/WindowAndTabMutator';

import SessionView from './view/SessionView';

const MANIFEST = require('./manifest.lnk.json');

interface State {
  session: BT.Session;
}

class App extends React.Component<{}, State> {

  private version: string;

  private sessionProvider: SessionProvider;
  private sessionMutator: SessionMutator;
  private windowMutator: WindowMutator;
  private tabMutator: TabMutator;

  constructor(props: {}) {
    super(props);
    console.assert(MANIFEST.version !== undefined, 'manifest.json must contain a "version" key.');
    this.version = MANIFEST.version || '0.0';

    const factory = new BananaFactory();

    this.sessionProvider = factory.createSessionProvider();
    this.sessionMutator = new DefaultSessionMutator(this.sessionProvider);
    const mutator = new WindowAndTabMutator(this.sessionProvider, factory.createBrowserController());
    this.tabMutator = this.windowMutator = mutator;
    this.state = { session: this.sessionProvider.session };

  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeEvent.bind(this));
    this.sessionProvider.onSessionChanged = session => {
      this.setState({ session });
    };
    this.sessionProvider.initialiseSession('componentDidMount');
  }

  componentWillMount() {
    window.removeEventListener('resize', this.handleResizeEvent);
  }

  render() {
    return (
      <SessionView
        version={this.version}
        session={this.state.session}
        sessionMutator={this.sessionMutator}
        windowMutator={this.windowMutator}
        tabMutator={this.tabMutator}
      />
    );
  }

  private handleResizeEvent(e: UIEvent) {
    this.sessionProvider.updateSession('handleResizeEvent');
  }

}

export default App;