document.addEventListener('DOMContentLoaded', () => {
  const naBorderColorPicker = document.getElementById('na-border-color');
  const mappedBorderColorPicker = document.getElementById('mapped-border-color');
  const applyColorsButton = document.getElementById('apply-colors');
  const popupContainer = document.getElementById('color-picker-container');

  // Load saved colors
  chrome.storage.sync.get(['naBorderColor', 'mappedBorderColor'], (data) => {
    if (data.naBorderColor) {
      naBorderColorPicker.value = data.naBorderColor;
    }
    if (data.mappedBorderColor) {
      mappedBorderColorPicker.value = data.mappedBorderColor;
    }
  });

  // Save colors and send message to content script
  applyColorsButton.addEventListener('click', () => {
    const naBorderColor = naBorderColorPicker.value;
    const mappedBorderColor = mappedBorderColorPicker.value;
    chrome.storage.sync.set({ naBorderColor, mappedBorderColor }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { naBorderColor, mappedBorderColor });
      });
    });
  });

  // Close the popup when clicking outside of it
  document.addEventListener('click', (event) => {
    if (!popupContainer.contains(event.target)) {
      window.close();
    }
  });

  // Prevent closing the popup when clicking inside it
  popupContainer.addEventListener('click', (event) => {
    event.stopPropagation();
  });
});
