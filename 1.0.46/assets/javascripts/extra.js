// Run on initial load
document.addEventListener("DOMContentLoaded", () => {
  checkContentHeight();
});

function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".content");

  // Remove active and grid-layout classes from all contents
  contents.forEach((content) => {
    content.classList.remove("active");
    content.classList.remove("grid-layout");
  });

  // Remove active class from all tabs
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Activate the selected tab and content
  document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add("active");
  const activeContent = document.getElementById(tabId);
  activeContent.classList.add("active");

  // Delay to allow rendering before checking height
  setTimeout(() => {
    requestAnimationFrame(() => {
      checkContentHeight();
    });
  }, 50);
}

//----------------Show table of contents when content is present inside otherwise dont display------------
window.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".md-sidebar--secondary");
  const toc = sidebar?.querySelector("nav.md-nav--secondary");

  if (sidebar && toc && toc.innerText.trim() !== "") {
    sidebar.classList.add("show-if-not-empty");
  }
});

//------------------------------------Add classes for page detection--------------------------------------

(function () {
  const norm = (p) => {
    if (!p) return "/";
    if (!p.startsWith("/")) p = "/" + p;
    p = p.replace(/\/index(\.html)?$/, "");
    if (p.length > 1) p = p.replace(/\/$/, "");
    return p || "/";
  };

  // Allowlist of pages/roots to be treated as "main-section"
  const ALLOWLIST = [
    "/preview-rdk/docs/getting-started",
    "/devices/docs",
    "/sitemap",
    "/entertainment/docs",
    "/entertainment/docs/sample_home1",
    "/entertainment/docs/sample_home3",
  ].map(norm);

  // Utility: match exact page or any path under a listed root
  const isAllowlisted = (path) => ALLOWLIST.includes(path);
  // ALLOWLIST.some((root) => path === root || path.startsWith(root + "/"));

  function applyFlags(where = "initial") {
    const rawPath = location.pathname;
    const path = norm(rawPath);

    // Compute homepage base via logo href (handles custom bases)
    const logoEl = document.querySelector("a.md-header__button.md-logo");
    const logoHref = logoEl?.getAttribute("href") || "/";
    const basePath = norm(new URL(logoHref, location.href).pathname);

    // Reset for SPA transitions
    document.body.classList.remove("is-homepage", "is-main-section");

    // Homepage
    if (path === basePath) {
      document.body.classList.add("is-homepage");
    }

    // Main section (path-based)
    if (isAllowlisted(path)) {
      document.body.classList.add("is-main-section");
    }

    // Debugging
    console.log("[flags]", {
      where,
      rawPath,
      path,
      basePath,
      isHomepage: path === basePath,
      isMainSection: document.body.classList.contains("is-main-section"),
      allowlist: ALLOWLIST,
    });
  }

  // Initial load
  window.addEventListener("DOMContentLoaded", () =>
    applyFlags("DOMContentLoaded"),
  );

  // SPA navigation (Material for MkDocs)
  if (window.document$?.subscribe) {
    window.document$.subscribe(() => applyFlags("document$"));
  }
})();

//--------------------Tabs for entertainment and connectivity in getting started page-----------------
function showTabs(tabName, event) {
  const tabs = {
    entertainment: document.getElementById("tab-entertainment"),
    connectivity: document.getElementById("tab-connectivity"),
  };

  // Hide all tabs
  Object.values(tabs).forEach((tab) => (tab.style.display = "none"));

  // Show selected tab
  tabs[tabName].style.display = "block";

  // Update active button
  document
    .querySelectorAll(".tab-button")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  showTabs("entertainment", {
    target: document.querySelector(".tab-button.active"),
  });
});

//----------------------------------Typing effect(homepage title)------------------------------------
(function () {
  const typeOnce = (el, opts = {}) => {
    const speed = opts.speed ?? 22;
    const delay = opts.delay ?? 0;

    const htmlContent =
      el.getAttribute("data-html")?.trim() || el.innerHTML.trim();
    const text = htmlContent
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, ""); // strip tags for typing
    const fullHeight = el.clientHeight;
    el.style.minHeight = fullHeight + "px";
    el.innerHTML = "";

    let i = 0;

    const tick = () => {
      const slice = text.slice(0, i).replace(/\n/g, "<br>");
      el.innerHTML = slice;
      i++;
      if (i <= text.length) {
        setTimeout(tick, speed);
      } else {
        el.classList.add("done");
        el.parentElement.classList.add("done"); // add to h1 for styling
        el.style.minHeight = "";
        el.innerHTML = htmlContent; // inject full styled HTML after typing
      }
    };

    setTimeout(tick, delay);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const head = document.getElementById("type-head");
    const para = document.getElementById("type-para");
    if (head) typeOnce(head, { speed: 15, delay: 220 });
    if (para) typeOnce(para, { speed: 10, delay: 250 });
  });
})();

//-------------------------Sidebar collapse functionality(left and right panes)--------------------------

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".md-container");

  function hasTOC() {
    const sidebar = document.querySelector(".md-sidebar--secondary");
    const toc = sidebar?.querySelector("nav.md-nav--secondary");
    return sidebar && toc && toc.innerText.trim() !== "";
  }

  function setupSidebarToggle({
    sidebarSelector,
    toggleId,
    toggleClass,
    collapsedClass,
    containerCollapsedClass,
    toggleLabelCollapsed,
    toggleLabelExpanded,
    localStorageKey,
  }) {
    const sidebar = document.querySelector(sidebarSelector);
    const scrollwrap = sidebar?.querySelector(".md-sidebar__scrollwrap");
    if (!container || !sidebar || sidebar.hasAttribute("hidden")) return;

    const firstNavItem = sidebar.querySelector(
      ".md-nav__list > li, nav .md-nav__list > li",
    );
    if (!firstNavItem || document.getElementById(toggleId)) return;

    const toggleButton = document.createElement("button");
    toggleButton.id = toggleId;
    toggleButton.className = toggleClass;
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-label", `Toggle ${sidebarSelector}`);
    toggleButton.innerHTML = toggleLabelExpanded;
    sidebar.appendChild(toggleButton);
    toggleButton.addEventListener("click", () => {
      const isCollapsed = sidebar.classList.toggle(collapsedClass);
      container.classList.toggle(containerCollapsedClass, isCollapsed);
      toggleButton.innerHTML = isCollapsed
        ? toggleLabelCollapsed
        : toggleLabelExpanded;
      localStorage.setItem(localStorageKey, isCollapsed ? "1" : "0");
    });

    const saved = localStorage.getItem(localStorageKey) === "1";
    if (saved) {
      sidebar.classList.add(collapsedClass);
      container.classList.add(containerCollapsedClass);
      toggleButton.innerHTML = toggleLabelCollapsed;
    }
  }

  function isDesktop() {
    return window.matchMedia("(min-width: 76.25em)").matches;
  }

  // Initial setup
  if (isDesktop()) {
    setupSidebarToggle({
      sidebarSelector: ".md-sidebar--primary",
      toggleId: "sidebarToggle",
      toggleClass: "sidebar-toggle",
      collapsedClass: "collapsed",
      containerCollapsedClass: "sidebar-collapsed",
      toggleLabelCollapsed: "»",
      toggleLabelExpanded: "«",
      localStorageKey: "leftnav-collapsed",
    });
  }

  if (hasTOC()) {
    const rightSidebar = document.querySelector(".md-sidebar--secondary");
    rightSidebar?.classList.add("show-if-not-empty");

    setupSidebarToggle({
      sidebarSelector: ".md-sidebar--secondary",
      toggleId: "sidebarToggleRight",
      toggleClass: "sidebar-toggle-right",
      collapsedClass: "collapsed",
      containerCollapsedClass: "sidebar-secondary-collapsed",
      toggleLabelCollapsed: "«",
      toggleLabelExpanded: "»",
      localStorageKey: "rightnav-collapsed",
    });
  }

  // Responsive behavior
  window.addEventListener("resize", () => {
    const leftSidebar = document.querySelector(".md-sidebar--primary");
    const rightSidebar = document.querySelector(".md-sidebar--secondary");
    const leftToggle = document.getElementById("sidebarToggle");
    const rightToggle = document.getElementById("sidebarToggleRight");

    if (isDesktop()) {
      if (!leftToggle && leftSidebar) {
        setupSidebarToggle({
          sidebarSelector: ".md-sidebar--primary",
          toggleId: "sidebarToggle",
          toggleClass: "sidebar-toggle",
          collapsedClass: "collapsed",
          containerCollapsedClass: "sidebar-collapsed",
          toggleLabelCollapsed: "»",
          toggleLabelExpanded: "«",
          localStorageKey: "leftnav-collapsed",
        });
      }
    } else {
      leftToggle?.remove();
      leftSidebar?.classList.remove("collapsed");
      container.classList.remove("sidebar-collapsed");
    }

    if (hasTOC()) {
      rightSidebar?.classList.add("show-if-not-empty");

      if (!rightToggle) {
        setupSidebarToggle({
          sidebarSelector: ".md-sidebar--secondary",
          toggleId: "sidebarToggleRight",
          toggleClass: "sidebar-toggle-right",
          collapsedClass: "collapsed",
          containerCollapsedClass: "sidebar-secondary-collapsed",
          toggleLabelCollapsed: "«",
          toggleLabelExpanded: "»",
          localStorageKey: "rightnav-collapsed",
        });
      }
    } else {
      rightToggle?.remove();
      rightSidebar?.classList.remove("collapsed");
      container.classList.remove("sidebar-secondary-collapsed");
      rightSidebar?.classList.remove("show-if-not-empty");
    }
  });
});

//--------------------------------collapsible button functionality(entertainment home)------------------------------
document.querySelectorAll(".see-all-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const section = this.closest(".topic-section");
    const doccards = section.querySelectorAll(".doccards .doccard");
    const isExpanded = this.getAttribute("data-expanded") === "true";

    if (!isExpanded) {
      doccards.forEach((card) => (card.style.display = "block"));
      this.textContent = "Show less ←";
      this.setAttribute("data-expanded", "true");
    } else {
      doccards.forEach((card, index) => {
        card.style.display = index < 4 ? "block" : "none";
      });
      this.textContent = "See all →";
      this.setAttribute("data-expanded", "false");
    }
  });
});

//--------------------------------------- Mermaid diagram expand to fullscreen, zoom-in, zoom-out and close-------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Mermaid Fullscreen] DOMContentLoaded fired");

  const observer = new MutationObserver(() => {
    const diagrams = document.querySelectorAll(".mermaid");
    console.log(
      `[Mermaid Fullscreen] Checking... Found ${diagrams.length} diagrams`,
    );

    if (diagrams.length > 0) {
      diagrams.forEach((diagram, index) => {
        if (diagram.dataset.fullscreenAdded) return;
        diagram.dataset.fullscreenAdded = "true";

        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-wrapper";

        function createButtonWithTooltip(
          text,
          className,
          tooltipText,
          positionClass,
        ) {
          const btnWrapper = document.createElement("div");
          btnWrapper.className = `tooltip-wrapper ${positionClass}`;

          const button = document.createElement("button");
          button.textContent = text;
          button.className = className;

          const tooltip = document.createElement("span");
          tooltip.className = "custom-tooltip";
          tooltip.textContent = tooltipText;

          btnWrapper.appendChild(button);
          btnWrapper.appendChild(tooltip);

          return { wrapper: btnWrapper, button };
        }

        const { wrapper: fullscreenBtnWrapper, button: fullscreenBtn } =
          createButtonWithTooltip(
            "⛶",
            "fullscreen-btn-inline",
            "Enter fullscreen",
            "fullscreen-btn-inline",
          );

        const { wrapper: closeBtnWrapper, button: closeBtn } =
          createButtonWithTooltip(
            "✕",
            "close-btn",
            "Exit fullscreen",
            "close-btn",
          );
        closeBtnWrapper.style.display = "none";

        const zoomControls = document.createElement("div");
        zoomControls.className = "zoom-controls";
        zoomControls.style.display = "none";

        const { wrapper: zoomInBtnWrapper, button: zoomInBtn } =
          createButtonWithTooltip("+", "zoom-btn", "Zoom in", "");
        const { wrapper: zoomOutBtnWrapper, button: zoomOutBtn } =
          createButtonWithTooltip("-", "zoom-btn", "Zoom out", "");

        zoomControls.appendChild(zoomInBtnWrapper);
        zoomControls.appendChild(zoomOutBtnWrapper);

        let zoomLevel = 100;

        function updateZoom() {
          const mermaidEl = wrapper.querySelector(".mermaid");
          if (mermaidEl) {
            mermaidEl.style.width = zoomLevel + "%";
            mermaidEl.style.height = "auto";
          }
        }

        zoomInBtn.addEventListener("click", () => {
          if (zoomLevel < 300) {
            zoomLevel += 10;
            updateZoom();
          }
        });

        zoomOutBtn.addEventListener("click", () => {
          zoomLevel = Math.max(50, zoomLevel - 10);
          updateZoom();
        });

        diagram.parentNode.insertBefore(wrapper, diagram);
        wrapper.appendChild(diagram);
        wrapper.appendChild(fullscreenBtnWrapper);
        wrapper.appendChild(closeBtnWrapper);
        wrapper.appendChild(zoomControls);

        fullscreenBtn.addEventListener("click", () => {
          wrapper.classList.add("fullscreen-active");
          fullscreenBtnWrapper.style.display = "none";
          closeBtnWrapper.style.display = "block";
          zoomControls.style.display = "flex";
          updateZoom();

          if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
          }
        });

        closeBtn.addEventListener("click", () => {
          document.exitFullscreen();
        });

        document.addEventListener("fullscreenchange", () => {
          if (!document.fullscreenElement) {
            wrapper.classList.remove("fullscreen-active");
            fullscreenBtnWrapper.style.display = "inline-flex";
            closeBtnWrapper.style.display = "none";
            zoomControls.style.display = "none";
            zoomLevel = 100;
            updateZoom();
          }
        });

        console.log(
          `[Mermaid Fullscreen] Buttons added for diagram #${index + 1}`,
        );
      });

      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

// Mobile panel for theme toggle and buttons
document.addEventListener("DOMContentLoaded", function () {
  const actionsToggle = document.getElementById("__actions");
  const backdrop = document.querySelector(".mobile-actions-backdrop");

  const headerInner = document.querySelector(".md-header__inner");
  const headerPalette = document.querySelector(
    ".md-header__inner [data-md-component='palette']",
  );
  const panelPaletteSlot = document.querySelector(
    ".mobile-actions-panel .palette-slot",
  );
  const panelButtonsSlot = document.querySelector(
    ".mobile-actions-panel .buttons-slot",
  );

  const originalParent = headerPalette ? headerPalette.parentNode : null;
  const originalNextSibling = headerPalette ? headerPalette.nextSibling : null;

  const moveNode = (node, target) => {
    if (node && target && node.parentNode !== target) {
      target.appendChild(node);
    }
  };

  const ensurePaletteBeforeButtons = () => {
    if (
      panelPaletteSlot &&
      panelButtonsSlot &&
      panelPaletteSlot.nextElementSibling !== panelButtonsSlot
    ) {
      panelButtonsSlot.parentNode.insertBefore(
        panelPaletteSlot,
        panelButtonsSlot,
      );
    }
  };

  const openPanel = () => {
    if (
      window.matchMedia("(max-width: 1024px)").matches &&
      headerPalette &&
      panelPaletteSlot
    ) {
      ensurePaletteBeforeButtons();
      moveNode(headerPalette, panelPaletteSlot);
    }
  };

  const restorePaletteToHeader = () => {
    if (!headerPalette || !originalParent) return;

    if (
      originalNextSibling &&
      originalNextSibling.parentNode === originalParent
    ) {
      originalParent.insertBefore(headerPalette, originalNextSibling);
    } else {
      originalParent.insertBefore(headerPalette, originalParent.firstChild);
    }
  };

  const closePanel = () => {
    restorePaletteToHeader();
  };

  // Backdrop click closes panel & restores palette
  if (actionsToggle && backdrop) {
    backdrop.addEventListener("click", () => {
      actionsToggle.checked = false;
      closePanel();
    });
  }

  // Toggle open/close
  if (actionsToggle) {
    actionsToggle.addEventListener("change", () => {
      if (actionsToggle.checked) openPanel();
      else closePanel();
    });
  }

  // On resize: when moving to desktop, restore palette to header and reset toggle
  const onResize = () => {
    if (window.matchMedia("(min-width: 1025px)").matches) {
      closePanel();
      if (actionsToggle) actionsToggle.checked = false;
    }
  };
  window.addEventListener("resize", onResize);

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && actionsToggle && actionsToggle.checked) {
      actionsToggle.checked = false;
      closePanel();
    }
  });
});
