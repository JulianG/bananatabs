import * as React from 'react';
import { PromisingChromeAPI } from './PromisingChromeAPI';
import BrowserEventDispatcher from '../model/mutators/BrowserEventDispatcher';
import ChromeEventDispatcher from '../chrome/ChromeEventDispatcher';

type Props = {
  chromeAPI: PromisingChromeAPI;
};

type State = {
  windows: chrome.windows.Window[];
};

export default class ChromeAPIView extends React.Component<Props, State> {
  private browserEventDispatcher: BrowserEventDispatcher;

  constructor(props: Props) {
    super(props);
    this.state = { windows: [] };
    this.browserEventDispatcher = new ChromeEventDispatcher(props.chromeAPI);
  }

  componentDidMount() {
    this.browserEventDispatcher.addListener(this.browserEventHandler);
    //
    this.browserEventHandler();
  }

  componentWillUnmount() {
    this.browserEventDispatcher.removeListener(this.browserEventHandler);
  }

  render() {
    return (
      <div>
        <h2>Fake Chrome</h2>
        <pre>{stateToString(this.state.windows)}</pre>
      </div>
    );
  }

  browserEventHandler = async () => {
    const windows = await this.props.chromeAPI.windows.getAll({});
    this.setState({ windows });
  };
}

function stateToString(windows: chrome.windows.Window[]): string {
  return windows.map(windowToString).join('\n');
}

function windowToString(w: chrome.windows.Window): string {
  return (
    `${w.id} (window):\n` + (w.tabs || []).map(tabToString).join('\n') + '\n'
  );
}

function tabToString(t: chrome.tabs.Tab): string {
  const title =
    t.title !== t.url && t.title !== '' && t.title !== undefined
      ? t.title + ' '
      : '';
  return `- ${t.id} - ${title}${t.url || ''} ${t.status || ''}`;
}
