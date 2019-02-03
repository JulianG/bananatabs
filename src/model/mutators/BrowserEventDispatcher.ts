export default interface BrowserEventDispatcher {
  addListener(listener: BrowserEventListener): void;
  removeListener(listener: BrowserEventListener): void;
}

interface BrowserEventListener {
  (event: string, reason?: string): void;
}
