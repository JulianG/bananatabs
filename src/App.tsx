import * as React from 'react';
import SessionView from './view/SessionView';

class App extends React.Component {

  private version: string;

  constructor(props: {}) {
    super(props);
    this.version = this.getVersion();
  }

  render() {
    return <SessionView version={this.version} />;
  }

  ///

  private getVersion(): string {
    const manifest = require('./manifest.json');
    console.assert(manifest.version !== undefined, 'manifes.json must contain a "version" key.');
    return (manifest.version || '0.0');
  }
}

export default App;