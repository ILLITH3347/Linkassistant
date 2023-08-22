  // post linkedin

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAutoLikeStatus') {
      chrome.storage.sync.get(['autoLikeEnabled'], function (result) {
        sendResponse({ autoLikeEnabled: result.autoLikeEnabled || false });
      });
      return true; // Indique que la réponse sera asynchrone
    }
  });