/* Valentine Property & Garden Care — site behaviour
   Modules: i18n · header & nav · reveal animations · service shortcuts
            gallery filter & lightbox · quote form · mobile bar */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var PHONE = "+4740301243";
  var STORAGE_KEY = "vpgc-lang";
  var T = window.TRANSLATIONS || {};
  var currentLang = "en";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var t = function (key) { return (T[currentLang] && T[currentLang][key]) || (T.en && T.en[key]) || ""; };

  /* ---------------------------------------------------------------- i18n */
  function storedLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storeLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
  }
  function detectLang() {
    var saved = storedLang();
    if (saved && T[saved]) return saved;
    var nav = (navigator.language || "en").toLowerCase();
    return /^(nb|nn|no)\b/.test(nav) ? "no" : "en";
  }

  function applyLanguage(lang) {
    if (!T[lang]) lang = "en";
    currentLang = lang;
    document.documentElement.lang = lang === "no" ? "nb" : "en";

    $$("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (!value) return;
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = value; // only used for trusted strings from translations.js
      else el.textContent = value;
    });
    $$("[data-i18n-placeholder]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-placeholder")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
    $$("[data-i18n-content]").forEach(function (el) { el.setAttribute("content", t(el.getAttribute("data-i18n-content"))); });

    $$(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    // Keep an open quote summary in the chosen language
    if (!$("#quote-result").hidden) renderResult();
  }

  $$(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      storeLang(lang);
      applyLanguage(lang);
    });
  });

  /* ------------------------------------------------------- header & nav */
  var header = $("#site-header");
  var toggle = $(".menu-toggle");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    var bar = $(".mobile-bar");
    if (bar) bar.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", function () { setMenu(!header.classList.contains("menu-open")); });
  $$("#main-nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1180) setMenu(false); });

  // Highlight the nav link for the section in view
  var navLinks = $$(".main-nav ul a");
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { sectionObserver.observe(s); });
  }

  /* -------------------------------------------------- reveal animations */
  var reveals = $$(".reveal");
  // Stagger siblings that reveal together (cards, list items)
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty("--delay", Math.min(i * 0.08, 0.4) + "s");
  });
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------- "Request this service" */
  $$("[data-service]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var select = $("#f-service");
      select.value = btn.getAttribute("data-service");
      clearError(select);
      showForm();
      $("#contact").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { $("#f-name").focus({ preventScroll: true }); }, 700);
    });
  });

  /* ------------------------------------------- gallery filter & lightbox */
  var filters = $$(".filter");
  var items = $$(".g-item");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      items.forEach(function (item) {
        item.classList.toggle("is-hidden", cat !== "all" && item.getAttribute("data-cat") !== cat);
      });
    });
  });

  var lightbox = $("#lightbox");
  var lbImg = $("#lb-img");
  var lbCap = $("#lb-cap");
  var lbIndex = 0;
  var lastFocus = null;

  function visibleItems() { return items.filter(function (i) { return !i.classList.contains("is-hidden"); }); }
  function showLightbox(index) {
    var list = visibleItems();
    if (!list.length) return;
    lbIndex = (index + list.length) % list.length;
    var img = $("img", list[lbIndex]);
    lbImg.src = img.getAttribute("src");
    lbImg.alt = img.alt;
    lbCap.textContent = $(".g-cap", list[lbIndex]).textContent;
  }
  function openLightbox(item) {
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    showLightbox(visibleItems().indexOf(item));
    $(".lb-close").focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (item) {
    $("button", item).addEventListener("click", function () { openLightbox(item); });
  });
  $(".lb-close").addEventListener("click", closeLightbox);
  $(".lb-prev").addEventListener("click", function () { showLightbox(lbIndex - 1); });
  $(".lb-next").addEventListener("click", function () { showLightbox(lbIndex + 1); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });

  /* ------------------------------------------------------- quote form */
  // The site is static (no server), so a valid request is turned into a
  // ready-to-send SMS. Connect a form service later — see README.md.
  var form = $("#quote-form");
  var result = $("#quote-result");
  var lastData = null;

  function fieldOf(el) { return el.closest(".field"); }
  function setError(el, msg) {
    var f = fieldOf(el);
    f.classList.add("has-error");
    $(".field-error", f).textContent = msg;
    el.setAttribute("aria-invalid", "true");
  }
  function clearError(el) {
    var f = fieldOf(el);
    f.classList.remove("has-error");
    $(".field-error", f).textContent = "";
    el.removeAttribute("aria-invalid");
  }

  function validate() {
    var ok = true;
    var firstBad = null;
    function fail(el, key) { setError(el, t(key)); ok = false; if (!firstBad) firstBad = el; }

    var name = form.elements.name, phone = form.elements.phone, email = form.elements.email,
        service = form.elements.service, consent = form.elements.consent;
    [name, phone, email, service, consent].forEach(clearError);

    if (!name.value.trim()) fail(name, "form.errRequired");
    var digits = phone.value.replace(/[^\d]/g, "");
    if (!phone.value.trim()) fail(phone, "form.errRequired");
    else if (digits.length < 8 || /[^\d\s+()-]/.test(phone.value)) fail(phone, "form.errPhone");
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) fail(email, "form.errEmail");
    if (!service.value) fail(service, "form.errRequired");
    if (!consent.checked) fail(consent, "form.errConsent");

    if (firstBad) firstBad.focus();
    return ok;
  }

  function buildMessage(d) {
    var serviceLabel = d.service === "several" ? t("form.several") : t("s." + d.service + ".title");
    var lines = [
      t("form.msgHeading"),
      t("form.msgName") + ": " + d.name,
      t("form.msgPhone") + ": " + d.phone
    ];
    if (d.email) lines.push(t("form.msgEmail") + ": " + d.email);
    lines.push(t("form.msgService") + ": " + serviceLabel);
    if (d.address) lines.push(t("form.msgAddress") + ": " + d.address);
    if (d.date) lines.push(t("form.msgDate") + ": " + d.date);
    if (d.message) lines.push(t("form.msgDetails") + ": " + d.message);
    return lines.join("\n");
  }

  function smsHref(body) {
    // iOS uses "&body=", Android uses "?body="
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return "sms:" + PHONE + (isIOS ? "&" : "?") + "body=" + encodeURIComponent(body);
  }

  function renderResult() {
    if (!lastData) return;
    var msg = buildMessage(lastData);
    $("#result-summary").textContent = msg;
    $("#sms-link").href = smsHref(msg);
  }

  function showForm() {
    result.hidden = true;
    form.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    lastData = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      service: form.elements.service.value,
      address: form.elements.address.value.trim(),
      date: form.elements.date.value,
      message: form.elements.message.value.trim()
    };
    renderResult();
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });

  // Clear an error as soon as the visitor fixes the field
  $$("input, select, textarea", form).forEach(function (el) {
    el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () {
      if (fieldOf(el).classList.contains("has-error")) clearError(el);
    });
  });

  $("#edit-btn").addEventListener("click", function () { showForm(); $("#f-name").focus(); });

  $("#copy-btn").addEventListener("click", function () {
    var btn = this;
    var label = $("span", btn);
    var text = $("#result-summary").textContent;
    var done = function () {
      label.textContent = t("form.copied");
      setTimeout(function () { label.textContent = t("form.copy"); }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { selectSummary(); });
    } else {
      selectSummary();
    }
  });
  function selectSummary() {
    var range = document.createRange();
    range.selectNodeContents($("#result-summary"));
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ------------------------------------------------------------- init */
  $("#year").textContent = new Date().getFullYear();
  applyLanguage(detectLang());
})();
