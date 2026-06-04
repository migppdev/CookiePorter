// ── State ──────────────────────────────────────────────
let currentScope = "tab";
let importMode = "merge";
let importData = null;
let cookieCache = [];

// ── Helpers ────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => (t.className = `toast ${type}`), 2500);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function getDomains(cookies) {
  const domains = new Set(cookies.map((c) => c.domain.replace(/^\./, "")));
  return (
    [...domains].slice(0, 3).join(", ") +
    (domains.size > 3 ? `… (+${domains.size - 3})` : "")
  );
}

// ── Tabs ───────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

// ── Scope buttons ──────────────────────────────────────
document.querySelectorAll(".scope-btn[data-scope]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".scope-btn[data-scope]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentScope = btn.dataset.scope;
    const wrap = document.getElementById("domain-input-wrap");
    wrap.style.display = currentScope === "domain" ? "block" : "none";
    refreshCount();
  });
});

// ── Import mode ────────────────────────────────────────
document.querySelectorAll(".scope-btn[data-import]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".scope-btn[data-import]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    importMode = btn.dataset.import;
  });
});

// ── Get cookies ────────────────────────────────────────
async function getCookiesForScope() {
  if (currentScope === "all") {
    return await chrome.cookies.getAll({});
  }

  if (currentScope === "domain") {
    const domain = document.getElementById("domain-input").value.trim();
    if (!domain) return [];
    const results = await chrome.cookies.getAll({ domain });
    return results;
  }

  // tab scope
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return [];
  try {
    const url = new URL(tab.url);
    return await chrome.cookies.getAll({ url: tab.url });
  } catch {
    return [];
  }
}

async function refreshCount() {
  try {
    cookieCache = await getCookiesForScope();
    document.getElementById("cookie-count").textContent = cookieCache.length;
    // Re-render list if visible
    const list = document.getElementById("cookie-list");
    if (list.style.display !== "none") renderCookieList();
  } catch (e) {
    document.getElementById("cookie-count").textContent = "!";
  }
}

function renderCookieList() {
  const list = document.getElementById("cookie-list");
  if (cookieCache.length === 0) {
    list.innerHTML = '<div class="empty-state">No cookies found</div>';
    return;
  }
  list.innerHTML = cookieCache
    .map(
      (c) => `
    <div class="cookie-item">
      <span class="cookie-name" title="${c.name}">${c.name}</span>
      <span class="cookie-domain" title="${c.domain}">${c.domain}</span>
    </div>
  `,
    )
    .join("");
}

// ── Preview toggle ─────────────────────────────────────
document.getElementById("btn-preview").addEventListener("click", () => {
  const list = document.getElementById("cookie-list");
  const btn = document.getElementById("btn-preview");
  if (list.style.display === "none") {
    list.style.display = "block";
    renderCookieList();
    btn.textContent = "Hide";
  } else {
    list.style.display = "none";
    btn.textContent = "View list";
  }
});

document.getElementById("btn-refresh").addEventListener("click", refreshCount);

document.getElementById("domain-input").addEventListener("input", () => {
  clearTimeout(window._domainTimer);
  window._domainTimer = setTimeout(refreshCount, 500);
});

// ── Export ─────────────────────────────────────────────
document.getElementById("btn-export").addEventListener("click", async () => {
  try {
    await refreshCount();
    if (cookieCache.length === 0) {
      showToast("No cookies to export", "error");
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const payload = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      exportedFrom: tab?.url || "unknown",
      scope: currentScope,
      cookieCount: cookieCache.length,
      cookies: cookieCache,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const scopeLabel =
      currentScope === "tab"
        ? "tab"
        : currentScope === "domain"
          ? document.getElementById("domain-input").value || "domain"
          : "all";

    const a = document.createElement("a");
    a.href = url;
    a.download = `cookies_${scopeLabel}_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`✓ ${cookieCache.length} cookies exported`);
  } catch (e) {
    showToast("Export error: " + e.message, "error");
  }
});

// ── File import ────────────────────────────────────────
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("drag-over");
});
dropzone.addEventListener("dragleave", () =>
  dropzone.classList.remove("drag-over"),
);
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) processFile(file);
});

function processFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.cookies || !Array.isArray(data.cookies))
        throw new Error("Invalid format");
      importData = data;

      // Show preview
      document.getElementById("prev-file").textContent = file.name;
      document.getElementById("prev-count").textContent = data.cookies.length;
      document.getElementById("prev-domains").textContent = getDomains(
        data.cookies,
      );
      document.getElementById("prev-date").textContent = formatDate(
        data.exportedAt,
      );
      document.getElementById("import-preview").classList.add("visible");
      document.getElementById("btn-import").disabled = false;

      showToast(`File loaded: ${data.cookies.length} cookies`);
    } catch (err) {
      showToast("Invalid or corrupted file", "error");
      importData = null;
      document.getElementById("btn-import").disabled = true;
      document.getElementById("import-preview").classList.remove("visible");
    }
  };
  reader.readAsText(file);
}

// ── Import ─────────────────────────────────────────────
document.getElementById("btn-import").addEventListener("click", async () => {
  if (!importData) return;

  const btn = document.getElementById("btn-import");
  btn.textContent = "⏳ Importing…";
  btn.disabled = true;

  let ok = 0,
    fail = 0;

  for (const cookie of importData.cookies) {
    try {
      // Build the URL for the cookie
      const scheme = cookie.secure ? "https" : "http";
      const domain = cookie.domain.startsWith(".")
        ? cookie.domain.slice(1)
        : cookie.domain;
      const url = `${scheme}://${domain}${cookie.path || "/"}`;

      const details = {
        url,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path || "/",
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite:
          cookie.sameSite === "no_restriction"
            ? "no_restriction"
            : cookie.sameSite === "lax"
              ? "lax"
              : cookie.sameSite === "strict"
                ? "strict"
                : "unspecified",
      };

      // Only set expiration if it's a persistent cookie
      if (cookie.expirationDate && cookie.expirationDate > Date.now() / 1000) {
        details.expirationDate = cookie.expirationDate;
      }

      await chrome.cookies.set(details);
      ok++;
    } catch (e) {
      fail++;
    }
  }

  btn.textContent = "⬇ Import cookies";
  btn.disabled = false;

  if (fail === 0) {
    showToast(`✓ ${ok} cookies imported`);
  } else {
    showToast(
      `${ok} imported, ${fail} failed`,
      fail > ok ? "error" : "success",
    );
  }
});

// ── Clear cookies ──────────────────────────────────────
document.getElementById("btn-clear").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) {
    showToast("No active tab", "error");
    return;
  }

  try {
    const cookies = await chrome.cookies.getAll({ url: tab.url });
    let removed = 0;
    for (const c of cookies) {
      const scheme = c.secure ? "https" : "http";
      const domain = c.domain.startsWith(".") ? c.domain.slice(1) : c.domain;
      const url = `${scheme}://${domain}${c.path}`;
      await chrome.cookies.remove({ url, name: c.name });
      removed++;
    }
    showToast(`✓ ${removed} cookies deleted`);
    await refreshCount();
  } catch (e) {
    showToast("Error deleting: " + e.message, "error");
  }
});

// ── Init ───────────────────────────────────────────────
refreshCount();
