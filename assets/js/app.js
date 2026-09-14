(function () {
  "use strict";

  var config = window.PORTFOLIO_CONFIG || {};

  function valueAtPath(path) {
    return path.split(".").reduce(function (current, key) {
      return current && current[key] !== undefined ? current[key] : "";
    }, config);
  }

  function isPublicUrl(value) {
    return typeof value === "string" && /^https:\/\//i.test(value.trim());
  }

  document.querySelectorAll("[data-config-text]").forEach(function (element) {
    var value = valueAtPath(element.dataset.configText);
    var placeholder = element.dataset.placeholder || "Adicionar informação";
    element.textContent = value && String(value).trim() ? String(value).trim() : placeholder;
    element.classList.toggle("is-placeholder", !value || !String(value).trim());
  });

  document.querySelectorAll("[data-link-key]").forEach(function (element) {
    var key = element.dataset.linkKey;
    var value = config.links && config.links[key] ? String(config.links[key]).trim() : "";
    var emptyLabel = element.dataset.emptyLabel || (element.classList.contains("text-link") ? "Adicionar link" : element.textContent.trim());

    if (isPublicUrl(value)) {
      element.href = value;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
      element.classList.remove("is-placeholder");
      element.removeAttribute("aria-disabled");
      element.textContent = element.dataset.readyLabel || "Abrir documento";
      if (element.classList.contains("text-link") || element.classList.contains("drive-link")) {
        var arrow = document.createElement("span");
        arrow.textContent = "↗";
        arrow.setAttribute("aria-hidden", "true");
        element.appendChild(arrow);
      }
    } else {
      element.removeAttribute("href");
      element.removeAttribute("target");
      element.removeAttribute("rel");
      element.classList.add("is-placeholder");
      element.setAttribute("aria-disabled", "true");
      element.textContent = emptyLabel;
      element.addEventListener("click", function (event) { event.preventDefault(); });
    }
  });

  document.querySelectorAll("[data-document-card]").forEach(function (card) {
    var link = card.querySelector("a[data-link-key]");
    if (!link || !link.href || link.classList.contains("is-placeholder")) return;

    card.classList.add("is-clickable");
    card.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      link.click();
    });
  });

  function youtubeId(input) {
    if (!input) return "";
    var value = String(input).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

    try {
      var url = new URL(value);
      var host = url.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
      if (host === "youtube.com" || host === "m.youtube.com") {
        if (url.pathname === "/watch") return url.searchParams.get("v") || "";
        var parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].indexOf(parts[0]) !== -1) return parts[1] || "";
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  var videoFrame = document.getElementById("video-frame");
  var videoPlaceholder = document.getElementById("video-placeholder");
  var videoId = youtubeId(config.youtube);
  if (videoFrame && videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + videoId;
    iframe.title = "Demonstração do Sistema de Gerenciamento de Atualizações de Clientes";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    videoFrame.replaceChildren(iframe);
  } else if (videoPlaceholder && config.youtube) {
    var warning = videoPlaceholder.querySelector("p");
    if (warning) warning.textContent = "O link informado não parece ser um vídeo válido do YouTube. Confira o campo youtube no arquivo de configuração.";
  }

  var menuButton = document.querySelector(".menu-toggle");
  var mainNav = document.getElementById("menu-principal");
  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  var backToTopButton = document.querySelector("[data-back-to-top]");
  if (backToTopButton) {
    backToTopButton.addEventListener("click", function () {
      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }

  var dialog = document.getElementById("lightbox");
  var stage = document.getElementById("lightbox-stage");
  var canvas = document.getElementById("lightbox-canvas");
  var image = document.getElementById("lightbox-image");
  var caption = document.getElementById("lightbox-caption");
  var zoomValue = document.getElementById("zoom-value");
  var zoom = 1;
  var baseWidth = 0;
  var baseHeight = 0;
  var canvasPadding = 56;

  function measureImage() {
    if (!stage || !image || !canvas || !image.naturalWidth || !image.naturalHeight) return;
    canvasPadding = window.innerWidth <= 600 ? 24 : 56;
    var availableWidth = Math.max(240, stage.clientWidth - canvasPadding);
    var availableHeight = Math.max(180, stage.clientHeight - canvasPadding);
    var fit = Math.min(availableWidth / image.naturalWidth, availableHeight / image.naturalHeight, 1);
    baseWidth = Math.round(image.naturalWidth * fit);
    baseHeight = Math.round(image.naturalHeight * fit);
    applyZoom(false);
  }

  function applyZoom(center) {
    if (!image || !canvas || !stage || !baseWidth || !baseHeight) return;
    var previousLeftRatio = stage.scrollWidth > stage.clientWidth ? (stage.scrollLeft + stage.clientWidth / 2) / stage.scrollWidth : .5;
    var previousTopRatio = stage.scrollHeight > stage.clientHeight ? (stage.scrollTop + stage.clientHeight / 2) / stage.scrollHeight : .5;
    var width = Math.round(baseWidth * zoom);
    var height = Math.round(baseHeight * zoom);
    image.style.width = width + "px";
    image.style.height = height + "px";
    canvas.style.width = Math.max(stage.clientWidth, width + canvasPadding) + "px";
    canvas.style.height = Math.max(stage.clientHeight, height + canvasPadding) + "px";
    if (zoomValue) zoomValue.textContent = Math.round(zoom * 100) + "%";
    if (center) {
      requestAnimationFrame(function () {
        stage.scrollLeft = stage.scrollWidth * previousLeftRatio - stage.clientWidth / 2;
        stage.scrollTop = stage.scrollHeight * previousTopRatio - stage.clientHeight / 2;
      });
    }
  }

  function setZoom(nextZoom) {
    zoom = Math.max(1, Math.min(4, nextZoom));
    applyZoom(true);
  }

  if (dialog && stage && canvas && image) {
    image.draggable = false;
    image.addEventListener("load", measureImage);

    document.querySelectorAll("[data-lightbox]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        zoom = 1;
        image.src = trigger.dataset.lightbox;
        image.alt = trigger.querySelector("img") ? trigger.querySelector("img").alt : "Imagem ampliada";
        caption.textContent = trigger.dataset.caption || image.alt;
        document.body.classList.add("lightbox-open");
        dialog.showModal();
      });
    });

    dialog.querySelector("[data-zoom-in]").addEventListener("click", function () { setZoom(zoom + .25); });
    dialog.querySelector("[data-zoom-out]").addEventListener("click", function () { setZoom(zoom - .25); });
    dialog.querySelector("[data-zoom-reset]").addEventListener("click", function () { setZoom(1); });
    dialog.querySelector("[data-lightbox-close]").addEventListener("click", function () { dialog.close(); });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
      canvas.removeAttribute("style");
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    stage.addEventListener("wheel", function (event) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? .25 : -.25));
    }, { passive: false });

    var dragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var scrollStartLeft = 0;
    var scrollStartTop = 0;
    stage.addEventListener("pointerdown", function (event) {
      if (zoom <= 1) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      scrollStartLeft = stage.scrollLeft;
      scrollStartTop = stage.scrollTop;
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      stage.scrollLeft = scrollStartLeft - (event.clientX - dragStartX);
      stage.scrollTop = scrollStartTop - (event.clientY - dragStartY);
    });
    stage.addEventListener("pointerup", function () { dragging = false; });
    stage.addEventListener("pointercancel", function () { dragging = false; });

    window.addEventListener("resize", function () {
      if (dialog.open) measureImage();
    });
  }

  var year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
