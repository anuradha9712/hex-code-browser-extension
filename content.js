(function () {

  console.log('hex color updated with mapping', colorMapping)

  // Function to replace colors and add borders
  function updateColorsInDOM() {
    const allElements = document.querySelectorAll("*");

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
        // Add a red border if the mapping is NA
        element.style.border = "2px solid red";
      } else if (mappedColor) {
        // Apply the mapped color and a yellow border
        element.style[property] = mappedColor;
        element.style.border = "2px solid yellow";
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

  // Execute the function
  updateColorsInDOM();
})();
