  <script>
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    document.querySelectorAll(".tline").forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".tline").forEach(function (el) { el.classList.add("in"); });
  }
  var nav = document.getElementById("nav");
  var dock = document.getElementById("dock");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);
    if (dock) {
      var start = document.getElementById("start");
      var pastHero = y > window.innerHeight * 0.7;
      var atForm = start && start.getBoundingClientRect().top < window.innerHeight * 0.85;
      dock.classList.toggle("show", pastHero && !atForm);
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  var consoleEl = document.getElementById("console");
  if (consoleEl) {
    var rows = consoleEl.querySelectorAll(".check");
    var played = false;
    function resolveRow(row) {
      var status = row.getAttribute("data-status");
      var result = row.getAttribute("data-result");
      var icon = row.querySelector(".check__icon");
      var statusEl = row.querySelector(".check__status");
      icon.classList.remove("pending"); icon.classList.add(status);
      icon.textContent = status === "ok" ? "✓" : "!";
      statusEl.classList.add(status); statusEl.textContent = result;
    }
    function play() {
      if (played) return; played = true;
      rows.forEach(function (row, i) {
        setTimeout(function () { row.classList.add("show"); }, i * 380);
        if (!reduce) { setTimeout(function () { resolveRow(row); }, i * 380 + 720); }
        else { resolveRow(row); row.classList.add("show"); }
      });
    }
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { play(); cio.disconnect(); } });
      }, { threshold: 0.4 });
      cio.observe(consoleEl);
    } else { play(); }
  }
  var tabBar = document.getElementById("tabs");
  if (tabBar) {
    var tabs = tabBar.querySelectorAll(".tab");
    var panels = document.querySelectorAll(".panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var idx = tab.getAttribute("data-tab");
        tabs.forEach(function (t) { t.classList.remove("active"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        tab.classList.add("active");
        var panel = document.querySelector('.panel[data-panel="' + idx + '"]');
        if (panel) panel.classList.add("active");
      });
    });
  }
  var faq = document.getElementById("faq");
  if (faq) {
    var buttons = faq.querySelectorAll(".faq__q");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.nextElementSibling;
        var open = btn.getAttribute("aria-expanded") === "true";
        buttons.forEach(function (o) {
          o.setAttribute("aria-expanded", "false");
          o.nextElementSibling.style.maxHeight = null;
        });
        if (!open) {
          btn.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }
  function collect(form) {
    return {
      doctor_name: (form.doctor_name.value || "").trim(),
      clinic_name: (form.clinic_name.value || "").trim(),
      city: (form.city.value || "").trim(),
      procedure: (form.procedure.value || "").trim(),
      submitted_at: new Date().toISOString()
    };
  }
  document.querySelectorAll("form[data-intake]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = collect(form);
      if (!data.doctor_name && !data.clinic_name) { form.querySelector(".field__input").focus(); return; }
      try { sessionStorage.setItem("medverify_intake", JSON.stringify(data)); } catch (err) {}
      window.location.href = "success.html";
    });
  });
})();
  </script>

