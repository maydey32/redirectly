document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createRule");

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("/pages/rule-editor.html")
      });
    });
  }

  loadRules();
});

async function loadRules() {
  const container = document.getElementById("rulesList");
  const data = await chrome.storage.local.get("rules");
  const rules = data.rules || [];

  container.innerHTML = "";

  document.getElementById("ruleCount").textContent =
    `${rules.length} active`;

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

    card.querySelector(".toggle").addEventListener("change", (e) => {
      chrome.runtime.sendMessage({
        type: "TOGGLE_RULE",
        ruleId: rule.id,
        enabled: e.target.checked
      });
    });

    card.querySelector(".delete-btn").addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: "DELETE_RULE",
        ruleId: rule.id
      });
      loadRules();
    });

    container.appendChild(card);
  });
}
