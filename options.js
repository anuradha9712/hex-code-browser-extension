document.addEventListener("DOMContentLoaded", () => {
  const updatedColorInput = document.getElementById("updatedColor");
  const noMappingColorInput = document.getElementById("noMappingColor");
  const status = document.getElementById("status");
  const form = document.getElementById("options-form");

  // Load saved settings
  chrome.storage.sync.get(["updatedColor", "noMappingColor"], (data) => {
    if (data.updatedColor) updatedColorInput.value = data.updatedColor;
    if (data.noMappingColor) noMappingColorInput.value = data.noMappingColor;
  });

  // Save settings when the form is submitted
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const updatedColor = updatedColorInput.value;
    const noMappingColor = noMappingColorInput.value;

    chrome.storage.sync.set({ updatedColor, noMappingColor }, () => {
      status.style.display = "block";
      setTimeout(() => (status.style.display = "none"), 2000);
    });
  });
});
