declare let globalThis: { chromeAPI: PromisingChromeAPI };

import * as React from 'react';
import { PromisingChromeAPI } from './PromisingChromeAPI';
import { ChromeEventDispatcher } from '../chrome/ChromeEventDispatcher';

type Props = { chromeAPI: PromisingChromeAPI };

export const ChromeAPIView: React.FC<Props> = ({ chromeAPI }) => {

  // making chromeAPI a global to enable acceess via the browser's console
  globalThis.chromeAPI = chromeAPI;

  const [windows, setWindows] = React.useState<chrome.windows.Window[]>([])

  React.useEffect(() => {
    const updateWindows = async () => setWindows([... (await chromeAPI.windows.getAll({}))]);
    const dispatcher = new ChromeEventDispatcher(chromeAPI);
    dispatcher.addListener(updateWindows);
    updateWindows();
    return () => dispatcher.removeListener(updateWindows);
  }, [chromeAPI]);

  return (
    <div>
      <h2>Fake Chrome</h2>
      <pre>{stateToString(windows)}</pre>
    </div>
  );
};

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
