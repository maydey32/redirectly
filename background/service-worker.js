console.log("Service worker started");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

  if (message.type === "ADD_RULE") {
    addRule(message.payload)
      .then(() => sendResponse({ success: true }))
      .catch(err => {
        console.error(err);
        sendResponse({ success: false });
      });

    return true; // VERY IMPORTANT for async
  }

  if (message.type === "DELETE_RULE") {
    deleteRule(message.ruleId);
  }

  if (message.type === "TOGGLE_RULE") {
    toggleRule(message.ruleId, message.enabled);
  }
});

async function addRule(ruleData) {
  const data = await chrome.storage.local.get("rules");
  const rules = data.rules || [];

  const newId = rules.length
    ? Math.max(...rules.map(r => r.id)) + 1
    : 1;

  let input = ruleData.matchValue.trim();

  // 🔥 Auto-handle full URLs
  let urlObj;
  try {
    urlObj = new URL(input);
  } catch (e) {
    alert("Invalid URL format");
    return;
  }

  // Build clean prefix
  const sourcePrefix =
    "||" + urlObj.host + urlObj.pathname;

  const newRule = {
    id: newId,
    matchValue: sourcePrefix,
    redirectTo: ruleData.redirectTo.trim(),
    enabled: true
  };

  rules.push(newRule);
  await chrome.storage.local.set({ rules });

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: newId,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { url: newRule.redirectTo }
      },
      condition: {
        urlFilter: newRule.matchValue
        // 🔥 NO resourceTypes = match ALL types
      }
    }],
    removeRuleIds: []
  });

  console.log("Rule added (universal mode):", newRule);
}


async function deleteRule(ruleId) {
  const data = await chrome.storage.local.get("rules");
  const rules = data.rules || [];

  const updated = rules.filter(r => r.id !== ruleId);
  await chrome.storage.local.set({ rules: updated });

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleId]
  });

  console.log("Rule deleted:", ruleId);
}


async function toggleRule(ruleId, enabled) {
  const data = await chrome.storage.local.get("rules");
  const rules = data.rules || [];

  const rule = rules.find(r => r.id === ruleId);
  if (!rule) return;

  rule.enabled = enabled;

  await chrome.storage.local.set({ rules });
}
