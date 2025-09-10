function toggleFeatures(event, containerId) {
  const button = event.currentTarget;
  const card = button.closest(".custom-box");
  const features = document.getElementById(containerId);
  const overlay = document.getElementById("overlay");
  const headerTop = document.querySelector(".md-top");
  const backToTopIcon = document.querySelector(".md-icon");
  const mdHeader = document.querySelector(".md-header");

  const isVisible = !features.classList.contains("hidden");

  // Hide all feature containers and remove highlights
  document.querySelectorAll(".features-container").forEach(fc => fc.classList.add("hidden"));
  document.querySelectorAll(".explore-button").forEach(btn => btn.classList.remove("highlight"));

  if (isVisible) {
    features.classList.add("hidden");
    overlay.classList.add("hidden");
    headerTop?.classList.remove("hidden");
    backToTopIcon?.classList.remove("hidden");
    mdHeader.style.position = "";
  } else {
    features.classList.remove("hidden");
    button.classList.add("highlight"); // highlight only the clicked button
    overlay.classList.remove("hidden");
    headerTop?.classList.add("hidden");
    backToTopIcon?.classList.add("hidden");
    mdHeader.style.position = "relative";

    const outsideClickListener = function (e) {
      if (!features.contains(e.target) && !button.contains(e.target)) {
        features.classList.add("hidden");
        button.classList.remove("highlight");
        overlay.classList.add("hidden");
        headerTop?.classList.remove("hidden");
        backToTopIcon?.classList.remove("hidden");
        mdHeader.style.position = "";
        document.removeEventListener("pointerup", outsideClickListener);
      }
    };

    document.addEventListener("pointerup", outsideClickListener);
  }
}

//tabs section
//2x2 layout for more than 5 lines of p
function checkContentHeight() {
  const activeContent = document.querySelector('.content.active');
  const paragraphs = activeContent.querySelectorAll('.box p');
  let shouldUseGrid = false;

  paragraphs.forEach(p => {
    const lineHeight = parseFloat(getComputedStyle(p).lineHeight);
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;

    if (p.scrollHeight > maxHeight) {
      shouldUseGrid = true;
    }
  });

  if (shouldUseGrid) {
    activeContent.classList.add('grid-layout');
  } else {
    activeContent.classList.remove('grid-layout');
  }
}

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


//Show table of contents when content is present inside otherwise dont display
window.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".md-sidebar--secondary");
  const toc = sidebar?.querySelector("nav.md-nav--secondary");

  if (sidebar && toc && toc.innerText.trim() !== "") {
    sidebar.classList.add("show-if-not-empty");
  }
});

//Add classes for page detection 
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

//Tabs for entertainment and connectivity in getting started page
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