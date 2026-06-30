function initNav() {
  const menu = document.querySelector("[data-menu]");
  const links = document.querySelector(".nav-links");
  if (!menu || !links) return;
  menu.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    menu.setAttribute("aria-expanded", String(open));
  });
}

function hasReachedLowerTrigger(element, viewportHeight, triggerRatio = 0.7) {
  const rect = element.getBoundingClientRect();
  const triggerLine = viewportHeight * triggerRatio;
  return rect.top <= triggerLine && rect.bottom >= 0;
}

function isNearlyOffscreen(element, viewportHeight) {
  const rect = element.getBoundingClientRect();
  const buffer = Math.min(120, viewportHeight * 0.12);
  return rect.bottom < -buffer || rect.top > viewportHeight + buffer;
}

function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const pending = new Set(items);
  let ticking = false;
  let firstPass = true;

  function update() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    pending.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const isInitialHero = firstPass && item.closest(".corporate-hero") && rect.top < viewportHeight * 0.82;
      if (isInitialHero || hasReachedLowerTrigger(item, viewportHeight)) {
        item.classList.add("is-visible");
        pending.delete(item);
      }
    });
    firstPass = false;
    ticking = false;
    if (!pending.size) {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    }
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function initScrollUnderlines() {
  const scopes = Array.from(document.querySelectorAll("[data-underline-scope]"));
  if (!scopes.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    scopes.forEach((scope) => scope.classList.add("is-underline-active"));
    return;
  }

  let ticking = false;

  function update() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    scopes.forEach((scope) => {
      const targets = Array.from(scope.querySelectorAll(".motion-underline"));
      const hasReachedText = targets.some((target) => hasReachedLowerTrigger(target, viewportHeight));
      if (hasReachedText) {
        scope.classList.add("is-underline-active");
      } else if (isNearlyOffscreen(scope, viewportHeight)) {
        scope.classList.remove("is-underline-active");
      }
    });

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function initUnderlineLines() {
  const targets = Array.from(document.querySelectorAll(".motion-underline"));
  if (!targets.length) return;

  const rebuildTarget = (target) => {
    const original = target.dataset.underlineText || target.textContent.trim();
    if (!original) return;
    target.dataset.underlineText = original;
    target.classList.remove("has-underline-lines");
    target.textContent = original;

    const words = original.split(/(\s+)/).filter(Boolean);
    if (!words.length) return;

    target.textContent = "";
    const fragments = words.map((word) => {
      const span = document.createElement("span");
      span.textContent = word;
      target.append(span);
      return span;
    });

    const lines = [];
    fragments.forEach((fragment) => {
      const top = Math.round(fragment.offsetTop);
      const current = lines[lines.length - 1];
      if (!current || Math.abs(current.top - top) > 2) {
        lines.push({ top, text: fragment.textContent });
      } else {
        current.text += fragment.textContent;
      }
    });

    target.textContent = "";
    const measuredLines = lines.length ? lines : [{ top: 0, text: original }];
    measuredLines.forEach((line, index) => {
      const lineSpan = document.createElement("span");
      lineSpan.className = "underline-line";
      lineSpan.textContent = line.text.trim();
      lineSpan.style.setProperty("--line-index", index);
      lineSpan.style.setProperty("--line-delay", `${index * 1320}ms`);
      target.append(lineSpan);
      if (index < measuredLines.length - 1) {
        target.append(document.createElement("br"));
      }
    });
    target.classList.add("has-underline-lines");
  };

  let resizeTimer = 0;
  const rebuildAll = () => {
    targets.forEach(rebuildTarget);
  };
  const scheduleRebuild = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuildAll, 140);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rebuildAll).catch(rebuildAll);
  } else {
    rebuildAll();
  }
  window.addEventListener("resize", scheduleRebuild);
}

function initProductDemos() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-product-demo]").forEach((demo) => {
    const menus = Array.from(demo.querySelectorAll("[data-demo-menu]"));
    const panels = Array.from(demo.querySelectorAll("[data-demo-panel]"));
    const title = demo.querySelector("[data-demo-title]");
    const desc = demo.querySelector("[data-demo-desc]");
    const address = demo.querySelector("[data-demo-address]");
    const modal = document.querySelector("[data-modal]");
    const modalImg = document.querySelector("[data-modal-img]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const openModal = demo.querySelector("[data-open-modal]");

    function setPanel(id) {
      const next = panels.find((panel) => panel.dataset.demoPanel === id) || panels[0];
      if (!next) return;

      panels.forEach((panel) => {
        panel.hidden = panel !== next;
        panel.classList.remove("is-entering");
      });
      if (!reduceMotion) {
        next.classList.add("is-entering");
        window.setTimeout(() => next.classList.remove("is-entering"), 520);
      }
      menus.forEach((button) => {
        const selected = button.dataset.demoMenu === next.dataset.demoPanel;
        button.setAttribute("aria-current", selected ? "page" : "false");
      });
      if (title) title.textContent = next.dataset.title || "";
      if (desc) desc.textContent = next.dataset.desc || "";
      if (address) address.textContent = next.dataset.address || "";
    }

    menus.forEach((button) => {
      button.addEventListener("click", () => setPanel(button.dataset.demoMenu));
    });

    demo.querySelectorAll("[data-demo-step]").forEach((button) => {
      button.addEventListener("click", () => {
        demo.querySelectorAll("[data-demo-step]").forEach((item) => item.removeAttribute("aria-current"));
        button.setAttribute("aria-current", "step");
        setPanel(button.dataset.demoStep);
      });
    });

    openModal?.addEventListener("click", () => {
      const active = panels.find((panel) => !panel.hidden);
      const image = active?.querySelector("img");
      if (!modal || !modalImg || !image) return;
      modalImg.src = image.currentSrc || image.src;
      modalImg.alt = image.alt;
      if (modalTitle) modalTitle.textContent = active?.dataset.title || image.alt;
      modal.setAttribute("open", "");
    });

    setPanel(menus[0]?.dataset.demoMenu || panels[0]?.dataset.demoPanel);
  });
}

function initCorePreviewPicker() {
  const picker = document.querySelector("[data-core-picker]");
  const preview = document.querySelector("[data-core-preview]");
  const demo = document.querySelector("[data-product-demo]");
  if (!picker || !preview || !demo) return;

  const cards = Array.from(picker.querySelectorAll("[data-core-target]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function focusPreview() {
    const top = preview.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
    preview.classList.remove("is-preview-focused");
    window.requestAnimationFrame(() => {
      preview.classList.add("is-preview-focused");
      window.setTimeout(() => preview.classList.remove("is-preview-focused"), 2200);
    });
    window.setTimeout(() => preview.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 720);
  }

  function selectSolution(target, shouldFocus) {
    const menu = demo.querySelector(`[data-demo-menu="${target}"]`);
    if (!menu) return;
    cards.forEach((card) => {
      const selected = card.dataset.coreTarget === target;
      if (selected) card.setAttribute("aria-current", "true");
      else card.removeAttribute("aria-current");
    });
    menu.click();
    if (shouldFocus) focusPreview();
  }

  selectSolution(cards[0]?.dataset.coreTarget, false);
}

function initModal() {
  const modal = document.querySelector("[data-modal]");
  const close = document.querySelector("[data-modal-close]");
  if (!modal) return;
  close?.addEventListener("click", () => modal.removeAttribute("open"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.removeAttribute("open");
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.removeAttribute("open");
  });
}

function initHeroBackground() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-page-bg-interaction]").forEach((field) => {
    field.addEventListener("pointermove", (event) => {
      const rect = field.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      field.style.setProperty("--page-spot-x", `${(x * 100).toFixed(1)}%`);
      field.style.setProperty("--page-spot-y", `${(y * 100).toFixed(1)}%`);
      field.style.setProperty("--page-grid-x", `${((x - 0.5) * 20).toFixed(1)}px`);
      field.style.setProperty("--page-grid-y", `${((y - 0.5) * 20).toFixed(1)}px`);
    });

    field.addEventListener("pointerleave", () => {
      field.style.setProperty("--page-spot-x", "50%");
      field.style.setProperty("--page-spot-y", "34%");
      field.style.setProperty("--page-grid-x", "0px");
      field.style.setProperty("--page-grid-y", "0px");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initUnderlineLines();
  initScrollUnderlines();
  initProductDemos();
  initCorePreviewPicker();
  initModal();
  initHeroBackground();
});
