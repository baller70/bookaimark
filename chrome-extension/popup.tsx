// Popup script for LinkPilot Browser Launcher
// Handles popup interactions and tab capture

document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn') as HTMLButtonElement;
  const status = document.getElementById('status') as HTMLDivElement;

  if (!captureBtn || !status) {
    console.error('Required DOM elements not found');
    return;
  }

  // Handle capture button click
  captureBtn.addEventListener('click', async () => {
    await handleCapture();
  });

  // Show status message
  function showStatus(message: string, type: 'success' | 'error') {
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');
    
    setTimeout(() => {
      status.classList.add('hidden');
    }, 3000);
  }

  // Handle tab capture
  async function handleCapture() {
    try {
      captureBtn.disabled = true;
      captureBtn.innerHTML = '<span>⏳</span> Capturing...';

      // Send message to background script
      const response = await new Promise<{ success: boolean }>((resolve) => {
        chrome.runtime.sendMessage({ type: 'capture_tabs' }, resolve);
      });

      if (response.success) {
        showStatus('✓ Tabs captured successfully!', 'success');
        captureBtn.innerHTML = '<span>✓</span> Captured!';
        
        // Close popup after success
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        throw new Error('Capture failed');
      }

    } catch (error) {
      console.error('Capture error:', error);
      showStatus('✗ Failed to capture tabs', 'error');
      captureBtn.innerHTML = '<span>📋</span> Capture Current Window';
    } finally {
      setTimeout(() => {
        captureBtn.disabled = false;
        if (captureBtn.innerHTML.includes('Capture Current Window')) {
          captureBtn.innerHTML = '<span>📋</span> Capture Current Window';
        }
      }, 2000);
    }
  }

  // Check if LinkPilot is open
  chrome.tabs.query({ url: 'http://localhost:3000/*' }, (tabs) => {
    if (tabs.length === 0) {
      showStatus('💡 Open LinkPilot first for best experience', 'success');
    }
  });
});

export {}; 