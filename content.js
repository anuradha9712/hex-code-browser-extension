(function () {
  console.log("hex color updated with mapping", colorMapping);

  // Default border colors
  let naBorderColor = "red"; // Default for "NA"
  let validBorderColor = "yellow"; // Default for valid mappings

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
        // Add a border using the user-specified NA color
        element.style.border = `2px solid ${naBorderColor}`;
      } else if (mappedColor) {
        // Apply the mapped color and add a border using the user-specified valid color
        element.style[property] = mappedColor;
        element.style.border = `2px solid ${validBorderColor}`;
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

  // Function to prompt users for colors
  function promptUserForColors() {
    const naColor = prompt("Enter the border color for 'NA' mappings (e.g., red, #ff0000):", naBorderColor);
    const validColor = prompt("Enter the border color for valid mappings (e.g., yellow, #ffff00):", validBorderColor);

    // Update the border colors if valid inputs are provided
    if (naColor) naBorderColor = naColor;
    if (validColor) validBorderColor = validColor;

    // Reapply updates with the new colors
    updateColorsInDOM();
  }

  // Add a button to let users set the border colors
  const button = document.createElement("button");
  button.textContent = "Set Border Colors";
  button.style.position = "fixed";
  button.style.bottom = "10px";
  button.style.right = "10px";
  button.style.zIndex = "10000";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
  document.body.appendChild(button);

  // Add click event listener to the button
  button.addEventListener("click", () => {
    promptUserForColors();
    updateColorsInDOM(); // Ensure borders are applied after color selection
  });

  // Initial execution
  updateColorsInDOM();
})();
