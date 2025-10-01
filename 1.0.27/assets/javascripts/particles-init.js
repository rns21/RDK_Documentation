document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  function loadParticles(theme) {
    console.log("Loading particles for theme:", theme);

    const configDefault = {
      fullScreen: { enable: false },
      particles: {
        number: { value: 290 },
        size: { value: 2 },
        move: { enable: false, speed: 0 },
        color: { value:"#00b2dc"},
        links: { enable: true, color: "#00b2dcff" ,opacity:0.15},
        opacity: { value: 0.3 },
      },
      background: { color: "transparent" },
      interactivity: {
        events: {
          onHover: { enable: false, mode: "repulse" },
          resize: true
        },
        modes: {
          repulse: { distance: 30, duration: 2 },
          grab: { distance: 140, line_linked: { opacity: 1 } }
        }
      }
    };

    const configSlate = {
      fullScreen: { enable: false },
      particles: {
        number: { value: 280 },
        size: { value: 2 },
        move: { enable: false, speed: 0.2 },
        color: { value:"#00b2dc"},
        links: { enable: true, color: "#303541ff" },
        opacity: { value: 0.3 },
      },
      background: { color: "transparent" },
      interactivity: {
        events: {
          onHover: { enable: false, mode: "repulse" },
          resize: true
        },
        modes: {
          repulse: { distance: 30, duration: 2 },
          grab: { distance: 140, line_linked: { opacity: 1 } }
        }
      }
    };

    const config = theme === "slate" ? configSlate : configDefault;
    window.tsParticles.load("tsparticles", config);
  }

  function observeThemeChanges() {
    const observer = new MutationObserver(() => {
      const theme = document.body.getAttribute("data-md-color-scheme");
      loadParticles(theme);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"]
    });

    // Initial load
    const initialTheme = document.body.getAttribute("data-md-color-scheme");
    loadParticles(initialTheme);
  }

  function waitForTsParticles(callback) {
    if (window.tsParticles) {
      callback();
    } else {
      console.log("Waiting for tsParticles...");
      setTimeout(() => waitForTsParticles(callback), 100);
    }
  }

  function waitForHomepageClass(callback) {
    if (document.body.classList.contains("is-homepage")) {
      callback();
    } else {
      console.log("Waiting for is-homepage class...");
      setTimeout(() => waitForHomepageClass(callback), 100);
    }
  }

  waitForHomepageClass(() => {
    console.log("is-homepage detected");

    waitForTsParticles(() => {
      console.log("tsParticles is available");

      const particlesContainer = document.createElement("div");
      particlesContainer.id = "tsparticles";
      document.body.appendChild(particlesContainer);

      observeThemeChanges();
    });
  });
});
