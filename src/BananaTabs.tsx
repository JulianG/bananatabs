import * as React from 'react';
import { BananaContext } from './context/BananaContext';
import { MainView } from './view/MainView';

const MANIFEST = require('./manifest.lnk.json');

console.assert(
  MANIFEST.version !== undefined,
  'manifest.json must contain a "version" key.'
);

interface Props {
  context: BananaContext;
}

export class BananaTabs extends React.Component<Props> {
  private version: string;
  private buildString: string;

  constructor(props: Props) {
    super(props);
    this.version = MANIFEST.version || '0.0';
    this.buildString = '';
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeEvent.bind(this));
    this.props.context.sessionProvider.onSessionChanged = _ => {
      this.forceUpdate();
    };
    this.props.context.sessionProvider.initialiseSession();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeEvent);
    this.props.context.sessionProvider.onSessionChanged = _ => {
      /**/
    };
  }

  render() {
    const { context } = this.props;
    return (
      <MainView
        version={this.version}
        buildString={this.buildString}
        session={context.sessionProvider.session}
        sessionMutator={context.sessionMutator}
        windowMutator={context.windowMutator}
        tabMutator={context.tabMutator}
      />
    );
  }

  private handleResizeEvent(e: UIEvent) {
    this.props.context.sessionProvider.updateSession();
  }
}
