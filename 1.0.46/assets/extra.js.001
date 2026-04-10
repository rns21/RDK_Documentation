// sidebar toggle
document.addEventListener("DOMContentLoaded", function () {
  const exploreBtn = document.getElementById("exploreBtn");
  const connectivityExploreBtn = document.getElementById("connectivityExploreBtn");
  const sidebar = document.getElementById("sidebar");
  const connectivitySidebar = document.getElementById("connectivitySidebar");
  const overlay = document.getElementById("overlay");

  let activeButton = null;
  let highlightTimeout = null;

  function closeAllSidebars() {
    sidebar?.classList.remove("visible");
    connectivitySidebar?.classList.remove("visible");
    overlay?.classList.remove("visible");

    if (activeButton) {
      activeButton.classList.remove("highlight");
      activeButton = null;
    }

    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }
  }

  function toggleSidebar(button, targetSidebar) {
    const isVisible = targetSidebar.classList.contains("visible");

    if (isVisible) {
      closeAllSidebars();
    } else {
      closeAllSidebars();
      targetSidebar.classList.add("visible");
      overlay.classList.add("visible");

      activeButton = button;
      activeButton.classList.add("highlight");
    }
  }

  exploreBtn?.addEventListener("click", () => toggleSidebar(exploreBtn, sidebar));
  connectivityExploreBtn?.addEventListener("click", () => toggleSidebar(connectivityExploreBtn, connectivitySidebar));
  overlay?.addEventListener("click", closeAllSidebars);

});


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




