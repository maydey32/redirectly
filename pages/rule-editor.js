document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveRule");

  saveBtn.addEventListener("click", async () => {
    const matchValue =
      document.getElementById("matchValue").value.trim();

    const redirectTo =
      document.getElementById("redirectTo").value.trim();

    if (!matchValue || !redirectTo) {
      alert("Both fields are required.");
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: "ADD_RULE",
        payload: { matchValue, redirectTo }
      });

      if (response?.success) {
        window.close();
      } else {
        alert("Background failed.");
      }

    } catch (error) {
      console.error(error);
      alert("Failed to save rule. Check console.");
    }
  });
});
