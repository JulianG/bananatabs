chrome.browserAction.onClicked.addListener((tab) => {
  const extURL = chrome.extension.getURL('index.html');
  chrome.windows.getAll({ populate: true }, (windows) => {
    const existingWindows = windows.filter((window) =>
      (window.tabs || []).some((tab) => tab.url === extURL)
    );
    if (existingWindows.length > 0) {
      const existingWindow = existingWindows[0];
      const existingTab = (existingWindow.tabs || []).find(
        (tab) => tab.url === extURL
      );
      if (existingTab) {
        chrome.windows.update(existingWindow.id, { focused: true });
        chrome.tabs.update(existingTab.id, { active: true });
      } else {
        console.error(
          "I detected an existing tab with BananaTabs!, but now I can't find it"
        );
      }
    } else {
      const panelGeometry = getLocalStoredPanelBounds();
      const createData = { url: extURL, type: 'panel', ...panelGeometry };
      chrome.windows.create(createData, function(tab) {
        console.log('BananaTabs! opened');
      });
    }
  });
});

function getLocalStoredPanelBounds() {
  const serialisedSession = localStorage.getItem('session') || 'null';
  const session = JSON.parse(serialisedSession);
  if (session) {
    if (session.panelWindow) {
      return session.panelWindow.bounds || session.panelWindow.geometry;
    } else {
      return session.panelGeometry || getDefaultPanelBounds();
    }
  }
  return getDefaultPanelBounds();
}

function getDefaultPanelBounds() {
  return {
    left: 0,
    top: 0,
    width: 480,
    height: window.screen.availHeight,
  };
}
