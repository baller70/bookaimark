// Background script for LinkPilot Browser Launcher
// Handles tab capture and communication with the web app

const APP_ORIGIN = 'http://localhost:3000';
const MAX_TABS = 40;

interface CapturedTab {
  id: number;
  url: string;
  title: string;
  favicon?: string;
}

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  await captureTabs();
});

// Listen for messages from content script (keyboard shortcut)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'capture_tabs') {
    await captureTabs();
    sendResponse({ success: true });
  }
});

// Main tab capture function
async function captureTabs(): Promise<void> {
  try {
    // Query current window tabs
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    // Filter and limit tabs
    const validTabs = tabs
      .filter(tab => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
      .slice(0, MAX_TABS);

    if (validTabs.length === 0) {
      console.warn('No valid tabs found to capture');
      return;
    }

    // Convert to our format
    const capturedTabs: CapturedTab[] = validTabs.map((tab, index) => ({
      id: index,
      url: tab.url || '',
      title: tab.title || 'Untitled',
      favicon: tab.favIconUrl
    }));

    console.log(`Captured ${capturedTabs.length} tabs`);

    // Try to send to web app via postMessage first
    const success = await sendToWebApp(capturedTabs);
    
    if (!success) {
      // Fallback: send via API
      await sendToAPI(capturedTabs);
    }

  } catch (error) {
    console.error('Failed to capture tabs:', error);
  }
}

// Send tabs to web app via postMessage
async function sendToWebApp(tabs: CapturedTab[]): Promise<boolean> {
  try {
    // Find LinkPilot tab
    const linkPilotTabs = await chrome.tabs.query({ 
      url: `${APP_ORIGIN}/*` 
    });

    if (linkPilotTabs.length === 0) {
      return false;
    }

    // Send message to first LinkPilot tab
    const targetTab = linkPilotTabs[0];
    
    await chrome.tabs.sendMessage(targetTab.id!, {
      type: 'tabs:capture',
      tabs: tabs
    });

    // Focus the LinkPilot tab
    await chrome.tabs.update(targetTab.id!, { active: true });
    await chrome.windows.update(targetTab.windowId!, { focused: true });

    return true;
  } catch (error) {
    console.error('Failed to send via postMessage:', error);
    return false;
  }
}

// Send tabs to API endpoint
async function sendToAPI(tabs: CapturedTab[]): Promise<void> {
  try {
    const response = await fetch(`${APP_ORIGIN}/api/tab-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tabs: tabs,
        prefs: {
          duplicateHandling: 'skip',
          maxTabs: MAX_TABS,
          autoTag: true,
          autoCategorize: true,
          undoWindowSecs: 8
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Tabs sent to API successfully:', result);

    // Open LinkPilot if not already open
    await chrome.tabs.create({ 
      url: `${APP_ORIGIN}/settings/ai/browser-launcher` 
    });

  } catch (error) {
    console.error('Failed to send to API:', error);
    throw error;
  }
}

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('LinkPilot Browser Launcher installed');
    
    // Open welcome page
    chrome.tabs.create({
      url: `${APP_ORIGIN}/settings/ai/browser-launcher`
    });
  }
});

export {}; 