(function () {
  console.log('hex color updated with mapping', colorMapping);

  // Function to replace colors and add borders
  function updateColorsInDOM(naBorderColor, mappedBorderColor) {
    const allElements = document.querySelectorAll("body, body *");

    // Helper to convert RGB or RGBA to Hex
    const rgbToHex = (rgb) => {
      const isRGBA = rgb.includes("rgba");
      const match = rgb.match(/\d+/g)?.slice(0, 3); // Extract RGB values
      if (!match) return rgb; // If it's not RGB(A), return as-is
      return isRGBA
        ? `rgba(${match.join(",")})`
        : `#${match.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("")}`;
    };

    // Helper to apply color updates and borders
    const applyColorUpdate = (element, property, color) => {
      const mappedColor = colorMapping[color];
      if (mappedColor === "NA") {
        // Add a border if the mapping is NA
        element.style.outline = `2px solid ${naBorderColor}`;
      } else if (mappedColor) {
        // Apply the mapped color and a border
        element.style[property] = mappedColor;
        element.style.outline = `2px solid ${mappedBorderColor}`;
      }
    };

    // Update inline styles and computed styles
    allElements.forEach((element) => {
      const computedStyle = getComputedStyle(element);

      // Check and update 'background-color'
      if (computedStyle.backgroundColor) {
        const bgColor = rgbToHex(computedStyle.backgroundColor);
        if (bgColor) applyColorUpdate(element, "backgroundColor", bgColor);
      }

      // Check and update 'color'
      if (computedStyle.color) {
        const textColor = rgbToHex(computedStyle.color);
        if (textColor) applyColorUpdate(element, "color", textColor);
      }
    });

    // Check styles applied via class names (from stylesheets)
    Array.from(document.styleSheets).forEach((styleSheet) => {
      // Skip stylesheets from fonts.googleapis.com
      if (styleSheet.href && styleSheet.href.includes('fonts.googleapis.com')) {
        return;
      }

      try {
        Array.from(styleSheet.cssRules || []).forEach((rule) => {
          if (rule.style && (rule.style.backgroundColor || rule.style.color)) {
            allElements.forEach((element) => {
              if (element.matches(rule.selectorText)) {
                // Check for 'background-color'
                if (rule.style.backgroundColor) {
                  const bgColor = rgbToHex(rule.style.backgroundColor);
                  if (bgColor) applyColorUpdate(element, "backgroundColor", bgColor);
                }

                // Check for 'color'
                if (rule.style.color) {
                  const textColor = rgbToHex(rule.style.color);
                  if (textColor) applyColorUpdate(element, "color", textColor);
                }
              }
            });
          }
        });
      } catch (e) {
        // Ignore cross-origin stylesheet access errors
        console.warn(`Cannot access stylesheet: ${styleSheet.href}`);
      }
    });
  }

  // Load saved colors and execute the function with a delay
  chrome.storage.sync.get(['naBorderColor', 'mappedBorderColor'], (data) => {
    const naBorderColor = data.naBorderColor || '#ff0000';
    const mappedBorderColor = data.mappedBorderColor || '#ffff00';
    setTimeout(() => {
      updateColorsInDOM(naBorderColor, mappedBorderColor);
    }, 1000); // Adjust the delay as needed
  });

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.naBorderColor && message.mappedBorderColor) {
      updateColorsInDOM(message.naBorderColor, message.mappedBorderColor);
    }
  });

  // Debounce function to limit the frequency of calls
  function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  // Observe changes in the DOM to handle dynamic content
  const observer = new MutationObserver(
    debounce(() => {
      chrome.storage.sync.get(['naBorderColor', 'mappedBorderColor'], (data) => {
        const naBorderColor = data.naBorderColor || '#ff0000';
        const mappedBorderColor = data.mappedBorderColor || '#ffff00';
        updateColorsInDOM(naBorderColor, mappedBorderColor);
      });
    }, 1000) // Adjust the debounce delay as needed
  );

  observer.observe(document.body, { childList: true, subtree: true });
})();
