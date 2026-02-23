document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createRule");

  createBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("pages/rule-editor.html")
    });
  });

  loadRules();
});

async function loadRules() {
  const container = document.getElementById("rulesList");
  const count = document.getElementById("ruleCount");

  const data = await chrome.storage.local.get("rules");
  const rules = data.rules || [];

  container.innerHTML = "";
  count.textContent = `${rules.length} active`;

  if (rules.length === 0) {
    container.innerHTML =
      "<p style='opacity:0.6;'>No rules created yet</p>";
    return;
  }

  rules.forEach(rule => {
    const card = document.createElement("div");
    card.className = "rule-card";

    card.innerHTML = `
      <div class="rule-title">
        ${rule.matchValue} → ${rule.redirectTo}
      </div>
      <div class="rule-actions">
        <button class="delete-btn">Delete</button>
        <input type="checkbox" class="toggle" ${rule.enabled ? "checked" : ""}>
      </div>
    `;

    // DELETE
    card.querySelector(".delete-btn")
      .addEventListener("click", async () => {
        await chrome.runtime.sendMessage({
          type: "DELETE_RULE",
          ruleId: rule.id
        });
        loadRules();
      });

    // TOGGLE
    card.querySelector(".toggle")
      .addEventListener("change", async (e) => {
        await chrome.runtime.sendMessage({
          type: "TOGGLE_RULE",
          ruleId: rule.id,
          enabled: e.target.checked
        });
      });

    container.appendChild(card);
  });
}
