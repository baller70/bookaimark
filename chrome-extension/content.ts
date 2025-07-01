// Content script for LinkPilot Browser Launcher
// Handles keyboard shortcuts and message passing

// Listen for keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Alt+Shift+B (or Cmd+Shift+B on Mac)
  const isShortcut = (event.altKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'b';
  
  if (isShortcut) {
    event.preventDefault();
    
    // Send message to background script
    chrome.runtime.sendMessage({ type: 'capture_tabs' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to send capture message:', chrome.runtime.lastError);
      } else {
        console.log('Tab capture initiated via keyboard shortcut');
      }
    });
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'tabs:capture') {
    // Forward to web app via postMessage
    window.postMessage(message, '*');
    sendResponse({ success: true });
  }
});

// Listen for messages from web app
window.addEventListener('message', (event) => {
  // Only accept messages from same origin for security
  if (event.origin !== window.location.origin) {
    return;
  }
  
  if (event.data.type === 'extension:ping') {
    // Respond to extension detection
    window.postMessage({ type: 'extension:pong' }, '*');
  }
});

export {}; 