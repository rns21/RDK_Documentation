// Run on initial load
document.addEventListener('DOMContentLoaded', () => {
  checkContentHeight();
});


function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.content');

  // Remove active and grid-layout classes from all contents
  contents.forEach(content => {
    content.classList.remove('active');
    content.classList.remove('grid-layout');
  });

  // Remove active class from all tabs
  tabs.forEach(tab => tab.classList.remove('active'));

  // Activate the selected tab and content
  document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add('active');
  const activeContent = document.getElementById(tabId);
  activeContent.classList.add('active');

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
    if (!p) return '/';                      // handle empty
    if (!p.startsWith('/')) p = '/' + p;     // ensure leading slash
    p = p.replace(/\/index(\.html)?$/, '');  // drop /index or /index.html
    if (p.length > 1) p = p.replace(/\/$/, ''); // drop trailing slash 
    return p || '/';
  };
 
  // section roots — keep leading / and no trailing /
  const ROOTS = ['/connectivity/docs', '/entertainment/docs', '/preview-rdk/getting-started'].map(norm);
 
  function applyFlags(where = 'initial') {
    const rawPath = location.pathname;         
    const path = norm(rawPath);               
 
    const logoEl = document.querySelector('a.md-header__button.md-logo');
    const logoHref = logoEl?.getAttribute('href') || '/';
    const basePath = norm(new URL(logoHref, location.href).pathname); 
 
    // remov prev cls(for SPA nav)
    document.body.classList.remove('is-homepage', 'is-main-section');
 
    // Homepage
    const isHome = path === basePath;
    if (isHome) document.body.classList.add('is-homepage');
 
    // Main section
    const matchedRoot = ROOTS.find((r) => path.includes(r));
    if (matchedRoot) document.body.classList.add('is-main-section');
 
    console.log('[flags]', { where, rawPath, path, logoHref, basePath, isHome, matchedRoot });
  }
 
  window.addEventListener('DOMContentLoaded', () => applyFlags('DOMContentLoaded'));
  if (window.document$?.subscribe) {
    window.document$.subscribe(() => applyFlags('document$'));
  }
 
})();



//--------------------Tabs for entertainment and connectivity in getting started page-----------------
function showTabs(tabName, event) {
  const tabs = {
    entertainment: document.getElementById("tab-entertainment"),
    connectivity: document.getElementById("tab-connectivity")
  };

  // Hide all tabs
  Object.values(tabs).forEach(tab => tab.style.display = "none");

  // Show selected tab
  tabs[tabName].style.display = "block";

  // Update active button
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
  showTabs("entertainment", { target: document.querySelector(".tab-button.active") });
});



//----------------------------------Typing effect(homepage title)------------------------------------
(function () {
  const typeOnce = (el, opts = {}) => {
    const speed = opts.speed ?? 22;
    const delay = opts.delay ?? 0;

    const htmlContent = el.getAttribute('data-html')?.trim() || el.innerHTML.trim();
    const text = htmlContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''); // strip tags for typing
    const fullHeight = el.clientHeight;
    el.style.minHeight = fullHeight + 'px';
    el.innerHTML = "";

    let i = 0;

    const tick = () => {
      const slice = text.slice(0, i).replace(/\n/g, '<br>');
      el.innerHTML = slice;
      i++;
      if (i <= text.length) {
        setTimeout(tick, speed);
      } else {
        el.classList.add('done');
        el.parentElement.classList.add('done'); // add to h1 for styling
        el.style.minHeight = "";
        el.innerHTML = htmlContent; // inject full styled HTML after typing
      }
    };

    setTimeout(tick, delay);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const head = document.getElementById('type-head');
    const para = document.getElementById('type-para');
    if (head) typeOnce(head, { speed: 20, delay: 200 });
    if (para) typeOnce(para, { speed: 10, delay: 250 });
  });
})();

//-------------------------Sidebar collapse functionality(left and right panes)--------------------------
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".md-container");

  function setupSidebarToggle({
    sidebarSelector,
    toggleId,
    toggleClass,
    collapsedClass,
    containerCollapsedClass,
    toggleLabelCollapsed,
    toggleLabelExpanded,
    localStorageKey
  }) {
    const sidebar = document.querySelector(sidebarSelector);
    if (!container || !sidebar) return;

    const firstNavItem = sidebar.querySelector(".md-nav__list > li, nav .md-nav__list > li");
    const desktop = window.matchMedia("(min-width: 76.25em)").matches;
    const hidden = sidebar.hasAttribute("hidden");

    if (!firstNavItem || !desktop || hidden) return;
    if (document.getElementById(toggleId)) return;

    const toggleButton = document.createElement("button");
    toggleButton.id = toggleId;
    toggleButton.className = toggleClass;
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-label", `Toggle ${sidebarSelector}`);
    toggleButton.innerHTML = toggleLabelExpanded;
    container.appendChild(toggleButton);

    toggleButton.addEventListener("click", () => {
      const isCollapsed = sidebar.classList.toggle(collapsedClass);
      container.classList.toggle(containerCollapsedClass, isCollapsed);
      toggleButton.innerHTML = isCollapsed ? toggleLabelCollapsed : toggleLabelExpanded;
      localStorage.setItem(localStorageKey, isCollapsed ? "1" : "0");
    });

    const saved = localStorage.getItem(localStorageKey) === "1";
    if (saved) {
      sidebar.classList.add(collapsedClass);
      container.classList.add(containerCollapsedClass);
      toggleButton.innerHTML = toggleLabelCollapsed;
    }
  }

  // for left sidebar
  setupSidebarToggle({
    sidebarSelector: ".md-sidebar--primary",
    toggleId: "sidebarToggle",
    toggleClass: "sidebar-toggle",
    collapsedClass: "collapsed",
    containerCollapsedClass: "sidebar-collapsed",
    toggleLabelCollapsed: "&raquo;",
    toggleLabelExpanded: "&laquo;",
    localStorageKey: "leftnav-collapsed"
  });

  // for right sidebar
  setupSidebarToggle({
    sidebarSelector: ".md-sidebar--secondary",
    toggleId: "sidebarToggleRight",
    toggleClass: "sidebar-toggle-right",
    collapsedClass: "collapsed",
    containerCollapsedClass: "sidebar-secondary-collapsed",
    toggleLabelCollapsed: "&laquo;",
    toggleLabelExpanded: "&raquo;",
    localStorageKey: "rightnav-collapsed"
  });
});

