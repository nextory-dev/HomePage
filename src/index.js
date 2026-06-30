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

function initUrlPreviewTool() {
  const tool = document.querySelector("[data-url-preview]");
  if (!tool) return;

  const input = tool.querySelector("[data-url-input]");
  const results = tool.querySelector("[data-url-results]");
  const status = tool.querySelector("[data-url-status]");
  const form = tool.querySelector(".url-preview-form");
  const reset = tool.querySelector("[data-url-reset]");
  const dataNode = document.querySelector("#press-preview-data");
  if (!input || !results || !form || !dataNode) return;

  let previews = [];
  try {
    previews = JSON.parse(dataNode.textContent || "[]");
  } catch {
    previews = [];
  }

  const normalizeUrl = (value) => {
    try {
      const url = new URL(value.trim());
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch {
      return "";
    }
  };

  const previewMap = new Map(previews.map((item) => [normalizeUrl(item.url), item]));
  const initialValue = input.value;

  function platformFromHost(hostname) {
    const host = hostname.replace(/^www\./, "");
    if (host.includes("linkedin")) return "LinkedIn";
    if (host === "x.com" || host.includes("twitter")) return "X";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("naver")) return "Naver";
    return host;
  }

  function fallbackPreview(rawUrl) {
    const url = new URL(rawUrl);
    const platform = platformFromHost(url.hostname);
    return {
      url: rawUrl,
      platform,
      type: "Link",
      title: `${platform} 링크 미리보기`,
      description: "등록된 메타데이터가 없는 URL입니다. 실제 운영 시 제목, 설명, 썸네일 정보를 입력해 카드 품질을 높일 수 있습니다.",
      date: "미등록"
    };
  }

  function render() {
    const urls = input.value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    results.textContent = "";

    const validItems = urls
      .map((url) => normalizeUrl(url))
      .filter(Boolean)
      .map((url) => previewMap.get(url) || fallbackPreview(url));

    validItems.forEach((item) => {
      const card = document.createElement("a");
      card.className = "url-preview-card";
      card.href = item.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.innerHTML = `
        <span class="url-preview-thumb">${item.platform.slice(0, 2).toUpperCase()}</span>
        <span class="url-preview-body">
          <span class="url-preview-meta"><b>${item.platform}</b><i>${item.type}</i><time>${item.date}</time></span>
          <strong>${item.title}</strong>
          <span>${item.description}</span>
          <small>${item.url}</small>
        </span>
      `;
      results.append(card);
    });

    if (status) {
      const invalidCount = urls.length - validItems.length;
      status.textContent = invalidCount > 0
        ? `${validItems.length}개 URL을 카드로 만들었습니다. 잘못된 URL ${invalidCount}개는 제외했습니다.`
        : `${validItems.length}개 URL을 카드로 만들었습니다.`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });

  reset?.addEventListener("click", () => {
    input.value = initialValue;
    render();
  });

  render();
}

function isPlaceholder(value) {
  return !value || value.includes("YOUR_");
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-contact-status]");
  const submit = form.querySelector('button[type="submit"]');
  const serviceId = form.dataset.emailjsService || "";
  const templateId = form.dataset.emailjsTemplate || "";
  const publicKey = form.dataset.emailjsPublicKey || "";

  const setStatus = (message, tone = "default") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (isPlaceholder(serviceId) || isPlaceholder(templateId) || isPlaceholder(publicKey)) {
      setStatus("EmailJS 설정값을 입력한 뒤 문의를 전송할 수 있습니다.", "warn");
      return;
    }

    if (!window.emailjs) {
      setStatus("EmailJS SDK를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }

    const formData = new FormData(form);
    const templateParams = Object.fromEntries(formData.entries());
    templateParams.sent_at = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    submit?.setAttribute("disabled", "");
    setStatus("문의 내용을 전송하고 있습니다.", "default");

    try {
      window.emailjs.init({ publicKey });
      await window.emailjs.send(serviceId, templateId, templateParams);
      form.reset();
      setStatus("문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.", "success");
    } catch {
      setStatus("전송 중 문제가 발생했습니다. 이메일 또는 전화로 문의해주세요.", "error");
    } finally {
      submit?.removeAttribute("disabled");
    }
  });
}

function loadExternalScript(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (existing.dataset.loaded === "true") resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", reject);
    document.head.append(script);
  });
}

function initKakaoMap() {
  const panel = document.querySelector("[data-kakao-map]");
  if (!panel) return;

  const canvas = panel.querySelector("[data-kakao-map-canvas]");
  const fallback = panel.querySelector("[data-kakao-map-fallback]");
  const appKey = panel.dataset.kakaoAppKey || "";
  const address = panel.dataset.address || "";
  const lat = Number(panel.dataset.lat);
  const lng = Number(panel.dataset.lng);

  const showFallback = () => {
    panel.classList.add("is-fallback");
    if (fallback) fallback.hidden = false;
  };

  if (!canvas || isPlaceholder(appKey)) {
    showFallback();
    return;
  }

  const sdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`;

  loadExternalScript(sdkUrl)
    .then(() => {
      if (!window.kakao?.maps) {
        showFallback();
        return;
      }

      window.kakao.maps.load(() => {
        const fallbackPosition = new window.kakao.maps.LatLng(lat || 37.500622, lng || 127.035392);
        const renderMap = (position) => {
          const map = new window.kakao.maps.Map(canvas, {
            center: position,
            level: 3
          });
          new window.kakao.maps.Marker({ map, position });
          panel.classList.remove("is-fallback");
          if (fallback) fallback.hidden = true;
        };

        if (window.kakao.maps.services && address) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              renderMap(new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)));
            } else {
              renderMap(fallbackPosition);
            }
          });
          return;
        }

        renderMap(fallbackPosition);
      });
    })
    .catch(showFallback);
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
  initUrlPreviewTool();
  initContactForm();
  initKakaoMap();
});
