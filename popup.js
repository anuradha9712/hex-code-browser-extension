document.addEventListener('DOMContentLoaded', () => {
  const naBorderColorPicker = document.getElementById('na-border-color');
  const mappedBorderColorPicker = document.getElementById('mapped-border-color');
  const applyColorsButton = document.getElementById('apply-colors');
  const popupContainer = document.getElementById('color-picker-container');
  const colorMappingsContainer = document.getElementById('color-mappings');
  const newColorInput = document.getElementById('new-color');
  const newMappingInput = document.getElementById('new-mapping');
  const addMappingButton = document.getElementById('add-mapping');

  // Load saved colors and mappings
  chrome.storage.sync.get(['naBorderColor', 'mappedBorderColor', 'colorMapping'], (data) => {
    if (data.naBorderColor) {
      naBorderColorPicker.value = data.naBorderColor;
    }
    if (data.mappedBorderColor) {
      mappedBorderColorPicker.value = data.mappedBorderColor;
    }
    if (data.colorMapping) {
      window.userColorMapping = data.colorMapping;
    } else {
      window.userColorMapping = {};
    }
    renderColorMappings();
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

  // Add new color mapping
  addMappingButton.addEventListener('click', () => {
    const newColor = newColorInput.value;
    const newMapping = newMappingInput.value;
    if (newColor && newMapping) {
      window.userColorMapping[newColor] = newMapping;
      chrome.storage.sync.set({ colorMapping: window.userColorMapping }, () => {
        renderColorMappings();
        notifyContentScript();
      });
    }
  });

  // Render color mappings
  function renderColorMappings() {
    colorMappingsContainer.innerHTML = '';
    const mergedColorMapping = { ...window.colorMapping, ...window.userColorMapping };
    for (const [color, mapping] of Object.entries(mergedColorMapping)) {
      const mappingItem = document.createElement('div');
      mappingItem.className = 'mapping-item';
      mappingItem.innerHTML = `
        <input type="text" class="color-input" value="${color}">
        <input type="text" class="mapping-input" value="${mapping}">
        <button class="remove-mapping">Remove</button>
      `;
      colorMappingsContainer.appendChild(mappingItem);

      // Update color mapping
      mappingItem.querySelector('.color-input').addEventListener('change', (event) => {
        const newColor = event.target.value;
        const oldColor = color;
        const mapping = window.userColorMapping[oldColor] || window.colorMapping[oldColor];
        delete window.userColorMapping[oldColor];
        window.userColorMapping[newColor] = mapping;
        chrome.storage.sync.set({ colorMapping: window.userColorMapping }, () => {
          renderColorMappings();
          notifyContentScript();
        });
      });

      // Update mapping value
      mappingItem.querySelector('.mapping-input').addEventListener('change', (event) => {
        const newMapping = event.target.value;
        window.userColorMapping[color] = newMapping;
        chrome.storage.sync.set({ colorMapping: window.userColorMapping }, notifyContentScript);
      });

      // Remove color mapping
      mappingItem.querySelector('.remove-mapping').addEventListener('click', () => {
        delete window.userColorMapping[color];
        chrome.storage.sync.set({ colorMapping: window.userColorMapping }, () => {
          renderColorMappings();
          notifyContentScript();
        });
      });
    }
  }

  // Notify content script to update colors
  function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { updateColors: true });
    });
  }

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
