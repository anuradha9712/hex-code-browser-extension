document.addEventListener("DOMContentLoaded", () => {
  const updatedColorInput = document.getElementById("updatedColor");
  const noMappingColorInput = document.getElementById("noMappingColor");
  const status = document.getElementById("status");
  const form = document.getElementById("colorForm");

  // Load saved settings and set default values
  chrome.storage.sync.get(["updatedColor", "noMappingColor"], (data) => {
    updatedColorInput.value = data.updatedColor || "#ffff00"; // Default yellow
    noMappingColorInput.value = data.noMappingColor || "#ff0000"; // Default red
  });

  // Save user-defined colors
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const updatedColor = updatedColorInput.value;
    const noMappingColor = noMappingColorInput.value;

    chrome.storage.sync.set({ updatedColor, noMappingColor }, () => {
      // Show a success message
      status.style.display = "block";
      status.textContent = "Colors saved successfully!";
      setTimeout(() => {
        status.style.display = "none";
      }, 2000);
    });
  });
});
