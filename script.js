(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "切換為深色主題" : "切換為淺色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme = stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initRandomDog() {
    const DOG_API = "https://dog.ceo/api/breeds/image/random";
    const btn = document.getElementById("random-dog-btn");
    const display = document.getElementById("dog-display");
    if (!btn || !display) return;

    function setLoading(isLoading) {
      btn.disabled = isLoading;
      btn.setAttribute("aria-busy", String(isLoading));
      display.setAttribute("aria-busy", String(isLoading));
      display.classList.toggle("is-loading", isLoading);

      if (isLoading) {
        display.innerHTML =
          '<div class="dog-display__loading" role="status">' +
          '<span class="dog-display__spinner" aria-hidden="true"></span>' +
          "<span>載入中…</span></div>";
      }
    }

    function clearLoading() {
      btn.disabled = false;
      btn.setAttribute("aria-busy", "false");
      display.setAttribute("aria-busy", "false");
      display.classList.remove("is-loading");
    }

    function showError(message) {
      clearLoading();
      display.innerHTML =
        '<p class="dog-display__error" role="alert">' + message + "</p>";
    }

    function showImage(url) {
      const img = new Image();
      img.className = "dog-display__img";
      img.alt = "隨機狗狗照片";
      img.decoding = "async";

      img.addEventListener("load", function () {
        clearLoading();
        display.innerHTML = "";
        display.appendChild(img);
      });

      img.addEventListener("error", function () {
        showError("圖片載入失敗，請再試一次。");
      });

      img.src = url;
    }

    btn.addEventListener("click", function () {
      setLoading(true);

      fetch(DOG_API)
        .then(function (res) {
          if (!res.ok) throw new Error("API 回應失敗");
          return res.json();
        })
        .then(function (data) {
          if (data.status !== "success" || !data.message) {
            throw new Error("無法取得圖片網址");
          }
          showImage(data.message);
        })
        .catch(function () {
          showError("取得圖片失敗，請稍後再試。");
        });
    });
  }

  function initCopyEmail() {
    const copyBtn = document.getElementById("copy-email");
    const emailLink = document.getElementById("footer-email");
    if (!copyBtn || !emailLink) return;

    copyBtn.addEventListener("click", function () {
      const email = emailLink.textContent.trim();
      if (!email) return;

      function showCopied() {
        copyBtn.textContent = "已複製";
        copyBtn.classList.add("is-copied");
        window.setTimeout(function () {
          copyBtn.textContent = "複製";
          copyBtn.classList.remove("is-copied");
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showCopied).catch(function () {
          /* ignore */
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initYear();
    initCopyEmail();
    initRandomDog();
  });
})();
