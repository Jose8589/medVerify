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

  /* ---------- Multi‑step wizard form ---------- */
  var wizardForm = document.getElementById('intake-form');
  if (wizardForm) {
    var stepDots = wizardForm.querySelectorAll('.step-dot');
    var steps = wizardForm.querySelectorAll('.form-step');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var submitBtn = document.getElementById('submit-btn');
    var step2Container = document.getElementById('step-2-container');
    var step3Container = document.getElementById('step-3-container');
    var step3Wrapper = document.getElementById('step-3-wrapper');
    var stepLine3 = document.getElementById('step-line-3');
    var stepLine4 = document.getElementById('step-line-4');
    var pkgPills = wizardForm.querySelectorAll('.intake-pkg-pill');
    var pkgNameEl = document.getElementById('form-pkg-name');
    var pkgPriceEl = document.getElementById('form-pkg-price');
    var btnPrice = document.getElementById('btn-price');
    var stepMeta = document.getElementById('step-meta');

    var currentStep = 1;
    var totalSteps = 4;
    var activePackage = 'compare';
    var packagePrices = { essential: 89, compare: 139, premium: 199 };

    function updatePackageUI(pkg) {
      var names = { essential: 'Essential Report', compare: 'Compare Report', premium: 'Premium Report' };
      if (pkgNameEl) pkgNameEl.textContent = 'Get ' + names[pkg];
      if (pkgPriceEl) pkgPriceEl.textContent = '$' + packagePrices[pkg];
      if (btnPrice) btnPrice.textContent = '$' + packagePrices[pkg];
      var dockPrice = document.getElementById('dock-price');
      if (dockPrice) dockPrice.textContent = 'From $' + packagePrices[pkg];
    }

    function renderDoctorFields(count) {
      var html = '';
      for (var i = 1; i <= count; i++) {
        html += '<div class="doctor-block">' +
          '<legend>Doctor ' + i + '</legend>' +
          '<div class="field-row">' +
            '<div class="field"><label class="field__label">Full name</label><input class="field__input" name="doctor_' + i + '_name" type="text" placeholder="Dr. First Last"></div>' +
            '<div class="field"><label class="field__label">Specialty</label><input class="field__input" name="doctor_' + i + '_specialty" type="text" placeholder="e.g. Plastic Surgery"></div>' +
          '</div>' +
          '<div class="field-row" style="margin-top:8px;">' +
            '<div class="field"><label class="field__label">Clinic / Hospital name</label><input class="field__input" name="doctor_' + i + '_clinic" type="text" placeholder="e.g. Hospital Ángeles"></div>' +
            '<div class="field"><label class="field__label">City</label><input class="field__input" name="doctor_' + i + '_city" type="text" placeholder="e.g. Tijuana"></div>' +
          '</div>' +
        '</div>';
      }
      if (step2Container) step2Container.innerHTML = html;
    }

    function updateStepVisibility() {
      var isPremium = activePackage === 'premium';
      if (step3Container) step3Container.style.display = isPremium ? '' : 'none';
      if (step3Wrapper) step3Wrapper.style.display = isPremium ? '' : 'none';
      if (stepLine3) stepLine3.style.display = isPremium ? '' : 'none';
      if (stepLine4) stepLine4.style.display = isPremium ? '' : 'none';
      totalSteps = isPremium ? 4 : 3;
      stepDots.forEach(function (dot) {
        var s = parseInt(dot.dataset.step);
        dot.style.display = s > totalSteps ? 'none' : '';
      });
    }

    function goToStep(step) {
      currentStep = Math.min(Math.max(step, 1), totalSteps);
      steps.forEach(function (s) { s.classList.remove('active-step'); });
      var activeEl = wizardForm.querySelector('.form-step[data-step="' + currentStep + '"]');
      if (activeEl) activeEl.classList.add('active-step');

      stepDots.forEach(function (dot) {
        var s = parseInt(dot.dataset.step);
        dot.classList.remove('active', 'done');
        if (s < currentStep) dot.classList.add('done');
        if (s === currentStep) dot.classList.add('active');
      });

      if (prevBtn) prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
      if (nextBtn && submitBtn && stepMeta) {
        if (currentStep === totalSteps) {
          nextBtn.style.display = 'none';
          submitBtn.style.display = 'inline-flex';
          stepMeta.style.display = 'none';
        } else {
          nextBtn.style.display = 'inline-flex';
          submitBtn.style.display = 'none';
          stepMeta.style.display = '';
        }
      }
    }

    // Package pills click (dentro del formulario)
    pkgPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pkgPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var pkg = pill.getAttribute('data-package');
        activePackage = pkg;
        updatePackageUI(pkg);
        renderDoctorFields({ essential: 1, compare: 2, premium: 3 }[pkg]);
        updateStepVisibility();
        goToStep(1);
      });
    });

    // Navigation buttons
    if (prevBtn) prevBtn.addEventListener('click', function () {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (currentStep < totalSteps) goToStep(currentStep + 1);
    });

    // Submit placeholder
// Configura tus links reales de Stripe Payment Links
var stripeLinks = {
  essential: 'https://buy.stripe.com/bJe6oG0LFh1Pbue1rp2cg02',   // ← pon aquí tu link real
  compare:   'https://buy.stripe.com/fZufZg1PJ8vjcyi0nl2cg01',
  premium:   'https://buy.stripe.com/9B6fZg65Z5j79m66LJ2cg00'
};

if (submitBtn) {
  submitBtn.addEventListener('click', function (e) {
    e.preventDefault();

    // Validar el email (el navegador ya lo hace con required, pero por si acaso)
    var emailInput = document.getElementById('f-email');
    if (!emailInput || !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    var link = stripeLinks[activePackage];
    if (!link) {
      alert('Error: no payment link configured.');
      return;
    }

    // Agregar el email como parámetro a la URL
    link += (link.includes('?') ? '&' : '?') + 'prefilled_email=' + encodeURIComponent(emailInput.value.trim());

    // Redirigir a Stripe
    window.location.href = link;
  });
}

    // Init with Compare package
    updatePackageUI('compare');
    renderDoctorFields(2);
    updateStepVisibility();
    goToStep(1);

    // 👇 NUEVO: Sincronizar los botones de las tarjetas de precios con el formulario
    document.querySelectorAll('.select-pkg-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var pkg = this.getAttribute('data-package');
        if (!pkg || !packagePrices[pkg]) return;

        // Activar la píldora correspondiente en el paso 1
        pkgPills.forEach(function (pill) {
          pill.classList.toggle('active', pill.getAttribute('data-package') === pkg);
        });

        // Actualizar el estado y la UI del formulario
        activePackage = pkg;
        updatePackageUI(pkg);
        renderDoctorFields({ essential: 1, compare: 2, premium: 3 }[pkg]);
        updateStepVisibility();
        goToStep(1);

        // Opcional: scroll más suave (descomenta las dos líneas siguientes si lo prefieres)
        // e.preventDefault();
        // document.getElementById('start').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
})();
