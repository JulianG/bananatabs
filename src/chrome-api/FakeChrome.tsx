import * as React from 'react';
import FakePromisingChromeAPI from './FakePromisingChromeAPI';
import BrowserEventDispatcher from '../model/mutators/BrowserEventDispatcher';
import ChromeEventDispatcher from '../chrome/ChromeEventDispatcher';

type Props = {
  api: FakePromisingChromeAPI;
};

export default class FakeChrome extends React.Component<Props, {}> {
  private renderCount: number = 0;
  private browserEventDispatcher: BrowserEventDispatcher;

  constructor(props: Props) {
		super(props);
		this.browserEventDispatcher = new ChromeEventDispatcher(props.api);
	}

	componentDidMount() {
		this.browserEventDispatcher.addListener(this.browserEventHandler);
	}

	componentWillUnmount() {
		this.browserEventDispatcher.removeListener(this.browserEventHandler);
	}
	
  render() {
    const fchrome = this.props.api;

    this.renderCount++;

    return (
      <div>
        <h2 onClick={this.handleClick}>Fake Chrome {this.renderCount}</h2>
        <pre>{stateToString(fchrome)}</pre>
      </div>
    );
  }

  handleClick = (e: React.MouseEvent) => {
    this.forceUpdate();
	}
	
	browserEventHandler = () => {
		this.forceUpdate();
	}
}

function stateToString(fchrome: FakePromisingChromeAPI): string {
  return fchrome.fakeWindows.map(windowToString).join('\n');
}

function windowToString(w: chrome.windows.Window): string {
  return `${w.id} (window):\n` + (w.tabs || []).map(tabToString).join('\n') + '\n';
}

function tabToString(t: chrome.tabs.Tab): string {
  const title = (t.title !== t.url && t.title !== '' && t.title !== undefined) ? t.title + ' ' : '';
  return `- ${t.id} - ${title}${t.url || ''} ${t.status || ''}`;
}
