/* MedVerify — interaction layer */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          if (e.target.classList.contains("tline")) e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    document.querySelectorAll(".tline").forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".tline").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Nav background on scroll ---------- */
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

  /* ---------- Live verification console ---------- */
  var consoleEl = document.getElementById("console");
  if (consoleEl) {
    var rows = consoleEl.querySelectorAll(".check");
    var played = false;
    function resolveRow(row) {
      var status = row.getAttribute("data-status");
      var result = row.getAttribute("data-result");
      var icon = row.querySelector(".check__icon");
      var statusEl = row.querySelector(".check__status");
      icon.classList.remove("pending");
      icon.classList.add(status);
      icon.textContent = status === "ok" ? "✓" : "!";
      statusEl.classList.add(status);
      statusEl.textContent = result;
    }
    function play() {
      if (played) return; played = true;
      rows.forEach(function (row, i) {
        setTimeout(function () { row.classList.add("show"); }, i * 380);
        if (!reduce) {
          setTimeout(function () { resolveRow(row); }, i * 380 + 720);
        } else {
          resolveRow(row); row.classList.add("show");
        }
      });
    }
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { play(); cio.disconnect(); } });
      }, { threshold: 0.4 });
      cio.observe(consoleEl);
    } else { play(); }
  }

  /* ---------- Report tabs ---------- */
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

  /* ---------- FAQ accordion ---------- */
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

  /* ---------- Dynamic Package & Intake Form Manager ---------- */
  var packages = {
    essential: { name: "Essential Report", price: "$89", numDoctors: 1 },
    compare: { name: "Compare Report", price: "$139", numDoctors: 2 },
    premium: { name: "Premium Report", price: "$199", numDoctors: 3 }
  };

  var currentPackage = "compare"; // Pre-selected default

  function renderDoctorFields(pkgKey) {
    var pkg = packages[pkgKey] || packages.compare;
    var container = document.getElementById("dynamic-doctor-fields");
    if (!container) return;

    var html = "";
    for (var i = 1; i <= pkg.numDoctors; i++) {
      var title = pkg.numDoctors > 1 ? "Doctor #" + i + " & Clinic Details" : "Doctor & Clinic Details";
      html += '<div class="doctor-block">';
      html += '  <div class="doctor-block__title"><span>' + title + '</span></div>';
      html += '  <div class="field">';
      html += '    <label class="field__label" for="f-doctor-' + i + '">Doctor #' + i + ' Full Name</label>';
      html += '    <input class="field__input" id="f-doctor-' + i + '" name="doctor_name_' + i + '" type="text" placeholder="e.g. Dr. Carlos Mendoza García">';
      html += '  </div>';
      html += '  <div class="field-row">';
      html += '    <div class="field">';
      html += '      <label class="field__label" for="f-clinic-' + i + '">Clinic or Hospital #' + i + '</label>';
      html += '      <input class="field__input" id="f-clinic-' + i + '" name="clinic_name_' + i + '" type="text" placeholder="e.g. Clínica Santa Fe">';
      html += '    </div>';
      html += '    <div class="field">';
      html += '      <label class="field__label" for="f-city-' + i + '">City #' + i + '</label>';
      html += '      <input class="field__input" id="f-city-' + i + '" name="city_' + i + '" type="text" placeholder="e.g. Tijuana, MX">';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
    }
    container.innerHTML = html;

    var teamField = document.getElementById("team-notes-field");
    if (teamField) {
      teamField.style.display = pkgKey === "premium" ? "block" : "none";
    }

    var nameEl = document.getElementById("form-pkg-name");
    var priceEl = document.getElementById("form-pkg-price");
    var btnPriceEl = document.getElementById("btn-price");

    if (nameEl) nameEl.textContent = "Get " + pkg.name;
    if (priceEl) priceEl.textContent = pkg.price;
    if (btnPriceEl) btnPriceEl.textContent = pkg.price;

    var pills = document.querySelectorAll(".intake-pkg-pill");
    pills.forEach(function (pill) {
      if (pill.getAttribute("data-package") === pkgKey) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  function setPackage(pkgKey) {
    if (!packages[pkgKey]) return;
    currentPackage = pkgKey;
    renderDoctorFields(pkgKey);
  }

  document.querySelectorAll(".select-pkg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pkgKey = btn.getAttribute("data-package");
      if (pkgKey) setPackage(pkgKey);
    });
  });

  document.querySelectorAll(".intake-pkg-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      var pkgKey = pill.getAttribute("data-package");
      if (pkgKey) setPackage(pkgKey);
    });
  });

  renderDoctorFields(currentPackage);

  function collect(form) {
    var pkg = packages[currentPackage] || packages.compare;
    var doctors = [];
    for (var i = 1; i <= pkg.numDoctors; i++) {
      var docName = (form["doctor_name_" + i] ? form["doctor_name_" + i].value : "").trim();
      var clinicName = (form["clinic_name_" + i] ? form["clinic_name_" + i].value : "").trim();
      var city = (form["city_" + i] ? form["city_" + i].value : "").trim();
      if (docName || clinicName) {
        doctors.push({
          doctor_name: docName,
          clinic_name: clinicName,
          city: city
        });
      }
    }

    return {
      package: currentPackage,
      package_name: pkg.name,
      price: pkg.price,
      procedure: (form.procedure ? form.procedure.value : "").trim(),
      team_notes: (form.team_notes ? form.team_notes.value : "").trim(),
      doctors: doctors,
      submitted_at: new Date().toISOString()
    };
  }

  document.querySelectorAll("form[data-intake]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = collect(form);
      if (data.doctors.length === 0) {
        var firstInput = form.querySelector(".field__input");
        if (firstInput) firstInput.focus();
        return;
      }
      try { sessionStorage.setItem("medverify_intake", JSON.stringify(data)); } catch (err) {}
      window.location.href = "success.html";
    });
  });
})();
