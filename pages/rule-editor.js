console.log("Rule Editor Loaded");

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveRule");

  saveBtn.addEventListener("click", () => {
    const matchValue = document.getElementById("matchValue").value.trim();
    const redirectTo = document.getElementById("redirectTo").value.trim();

    if (!matchValue || !redirectTo) {
      alert("Both fields are required");
      return;
    }

    chrome.runtime.sendMessage({
      type: "ADD_RULE",
      payload: {
        matchValue,
        redirectTo
      }
    });

    alert("Rule Sent To Background");
  });
});
