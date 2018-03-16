import * as React from 'react';
import SessionView from './view/SessionView';

const MANIFEST = require('./manifest.lnk.json');

class App extends React.Component {

  private version: string;

  constructor(props: {}) {
    super(props);
    console.assert(MANIFEST.version !== undefined, 'manifest.json must contain a "version" key.');
    this.version = MANIFEST.version || '0.0';
  }

  render() {
    return <SessionView version={this.version} />;
  }

}

export default App;