console.log("Service worker started");
const RULE_PREFIX = 1000;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Mini Redirectly Installed");
});

chrome.runtime.onMessage.addListener((message) => {
  console.log("Message received in background:", message);

  if (message.type === "ADD_RULE") {
    addRule(message.payload);
  }
});



async function addRule(ruleData) {
  const data = await chrome.storage.local.get(["rules", "nextRuleId"]);

  const rules = data.rules || [];
  let nextRuleId = data.nextRuleId || 1;

  // Force 32-bit safe integer
  nextRuleId = nextRuleId & 0x7fffffff;

  const newRule = {
    id: nextRuleId,
    matchValue: ruleData.matchValue,
    redirectTo: ruleData.redirectTo,
    enabled: true
  };

  rules.push(newRule);

  await chrome.storage.local.set({
    rules,
    nextRuleId: nextRuleId + 1
  });

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [nextRuleId],
    addRules: [convertToDNR(newRule)]
  });

  console.log("Rule added with ID:", nextRuleId);
}


async function deleteRule(ruleId) {
  const rules = await getStoredRules();
  const updated = rules.filter(r => r.id !== ruleId);

  await chrome.storage.local.set({ rules: updated });

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleId]
  });
}

async function toggleRule(ruleId, enabled) {
  const rules = await getStoredRules();
  const rule = rules.find(r => r.id === ruleId);
  if (!rule) return;

  rule.enabled = enabled;
  await chrome.storage.local.set({ rules });

  if (enabled) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [convertToDNR(rule)],
      removeRuleIds: []
    });
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId]
    });
  }
}

function convertToDNR(rule) {
  return {
    id: rule.id | 0,  // force 32-bit int
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        url: rule.redirectTo
      }
    },
    condition: {
      regexFilter: "^https?://.*" + rule.matchValue.replace(/\./g, "\\.") + ".*",
      resourceTypes: ["main_frame"]
    }
  };
}


async function getStoredRules() {
  const data = await chrome.storage.local.get("rules");
  return data.rules || [];
}
