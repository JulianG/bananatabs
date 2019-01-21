import * as React from 'react';
import * as BT from '../model/CoreTypes';

import SessionMutator from '../model/mutators/SessionMutator';
import WindowMutator from '../model/mutators/WindowMutator';
import TabMutator from '../model/mutators/TabMutator';

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
}

export default class MainView extends React.Component<Props, State> {
  readonly state: State = { mode: 'list', windowId: 0 };

  constructor(props: Props) {
    super(props);
    this.changeMode = this.changeMode.bind(this);
  }

  render() {
    return (
      <div>
        <Title />
        {this.renderBody()}
        <Footer
          version={this.props.version}
          buildString={this.props.buildString}
        />
      </div>
    );
  }

  private renderBody() {
    switch (this.state.mode) {
      case 'list':
        return this.renderListMode();
      case 'read':
        return this.renderReadMode();
      case 'write':
        return this.renderWriteMode();
      default:
        return null;
    }
  }

  private renderListMode() {
    const { session, sessionMutator, windowMutator, tabMutator } = this.props;
    return (
      <>
        <WindowListView
          windows={session.windows}
          sessionMutator={sessionMutator}
          windowMutator={windowMutator}
          tabMutator={tabMutator}
          onWindowCopied={windowId => this.changeMode('read', windowId)}
        />
        <MainViewCmdButtons
          onPaste={this.changeMode('write')}
          onCopyAll={this.changeMode('read')}
        />
      </>
    );
  }

  private renderReadMode() {
    const windows = this.props.session.windows;
    const { windowId } = this.state;
    return (
      <TextWindowView
        windows={windows.filter(w => {
          return windowId === -1 || w.id === windowId;
        })}
        onClose={this.changeMode('list')}
      />
    );
  }

  private renderWriteMode() {
    return (
      <NewWindowView
        minimumLines={10}
        sessionMutator={this.props.sessionMutator}
        onClose={this.changeMode('list')}
      />
    );
  }

  private changeMode(mode: State['mode'], windowId: number = -1) {
    return () => this.setState({ mode, windowId });
  }
}
