document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initCodeBlocks();
  initCheckpoints();
  initTabs();
  initHamburger();
});

function initThemeToggle() {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? "Light mode" : "Dark mode";

  btn.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "");
    try { localStorage.setItem("theme", next); } catch (e) {}
    btn.textContent = next === "dark" ? "Light mode" : "Dark mode";
  });
}

function initHamburger() {
  var btn = document.querySelector(".menu-toggle");
  if (!btn) return;

  var overlay = document.createElement("div");
  overlay.className = "nav-overlay";

  var drawer = document.createElement("nav");
  drawer.className = "nav-drawer";
  drawer.setAttribute("aria-label", "Site navigation");

  var closeBtn = document.createElement("button");
  closeBtn.className = "nav-drawer-close";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close menu");
  drawer.appendChild(closeBtn);

  // Module links — prefer .module-nav-bar, fall back to .module-list
  var navBar = document.querySelector(".module-nav-bar");
  var moduleLinks = navBar
    ? navBar.querySelectorAll("a")
    : document.querySelectorAll(".module-list a");

  if (moduleLinks.length) {
    var modHeading = document.createElement("p");
    modHeading.className = "nav-drawer-heading";
    modHeading.textContent = "Modules";
    drawer.appendChild(modHeading);
    var modList = document.createElement("ul");
    modList.className = "nav-drawer-list";
    moduleLinks.forEach(function (a) {
      var li = document.createElement("li");
      var link = a.cloneNode(true);
      link.addEventListener("click", close);
      li.appendChild(link);
      modList.appendChild(li);
    });
    drawer.appendChild(modList);
  }

  var h2s = document.querySelectorAll("h2");
  if (h2s.length) {
    var secHeading = document.createElement("p");
    secHeading.className = "nav-drawer-heading";
    secHeading.textContent = "On this page";
    drawer.appendChild(secHeading);
    var secList = document.createElement("ul");
    secList.className = "nav-drawer-list nav-drawer-sections";
    h2s.forEach(function (h2) {
      if (!h2.id) {
        h2.id = h2.textContent.trim().toLowerCase()
          .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
          .replace(/-+/g, "-").replace(/^-|-$/g, "");
      }
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + h2.id;
      link.textContent = h2.textContent.trim();
      link.addEventListener("click", close);
      li.appendChild(link);
      secList.appendChild(li);
    });
    drawer.appendChild(secList);
  }

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function open() {
    overlay.classList.add("open");
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
    document.body.style.overflow = "";
  }
  btn.addEventListener("click", open);
  overlay.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
}

function initCodeBlocks() {
  document.querySelectorAll(".code-block").forEach((block) => {
    const btn = block.querySelector(".run-btn");
    const textarea = block.querySelector("textarea");
    const output = block.querySelector(".code-output");
    if (!btn || !textarea || !output) return;

    btn.addEventListener("click", async () => {
      const code = textarea.value;

      if (block.classList.contains("live")) {
        btn.textContent = "Running...";
        btn.disabled = true;
        const result = await window.runPython(code);
        output.textContent = result.output || "(no output)";
        output.classList.add("visible");
        btn.textContent = "Run";
        btn.disabled = false;
      } else if (block.classList.contains("simulated")) {
        const precomputed = block.getAttribute("data-output");
        output.textContent = precomputed || "(no simulated output)";
        output.classList.add("visible");
      }
    });
  });
}

function initCheckpoints() {
  document.querySelectorAll(".checkpoint").forEach((cp) => {
    const inputs = cp.querySelectorAll('input[type="radio"]');
    const feedback = cp.querySelector(".feedback");
    if (!inputs.length || !feedback) return;

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        const correct = cp.getAttribute("data-correct");
        if (input.value === correct) {
          feedback.textContent = "Correct.";
        } else {
          feedback.textContent = "Not quite. Try again.";
        }
        feedback.classList.add("visible");
      });
    });
  });
}

function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll(".tab-btn");
    const contents = tabGroup.querySelectorAll(".tab-content");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const target = tabGroup.querySelector(
          `.tab-content[data-tab="${btn.getAttribute("data-tab")}"]`
        );
        if (target) target.classList.add("active");
      });
    });
  });
}
