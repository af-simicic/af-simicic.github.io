// Menú móvil
(function() {
  var toggle = document.getElementById("mobile-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", mobileNav.classList.contains("open"));
    });
  }
})();

// Copiar código
document.querySelectorAll(".code-copy").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var codeEl = btn.closest(".code-block")?.querySelector("code");
    if (codeEl) {
      navigator.clipboard.writeText(codeEl.textContent);
      var orig = btn.textContent;
      btn.textContent = "✓ copiado";
      setTimeout(function() { btn.textContent = orig; }, 2000);
    }
  });
});

// Buscador
document.addEventListener("DOMContentLoaded", function () {

  var input = document.getElementById("search");
  var results = document.getElementById("results");

  if (!input || !results) return;

  fetch('/af-simicic/index.json')
    .then(function(r) { return r.json(); })
    .then(function(DATA) {

      input.addEventListener("input", function() {

        var q = this.value.toLowerCase();

        var out = DATA.filter(function(p) {
          return (
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            (p.tags || []).join(" ").toLowerCase().includes(q)
          );
        }).slice(0, 5);

        results.innerHTML = out.map(function(p) {
          return '<li><a href="' + p.permalink + '">' + p.title + '</a></li>';
        }).join("");

      });

    });

});
