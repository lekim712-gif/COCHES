/* Utilidades comunes de las calculadoras (formato español, lectura de números con coma o punto). */
(function () {
  function parse(s) {
    s = String(s == null ? '' : s).replace(/\s/g, '');
    if (!s) return NaN;
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s);
  }
  window.C = {
    n: function (id) { var el = document.getElementById(id); return el ? parse(el.value) : NaN; },
    fmt: function (v, d) { d = d == null ? 2 : d; return isFinite(v) ? v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'; },
    eur: function (v, d) { return isFinite(v) ? window.C.fmt(v, d == null ? 2 : d) + ' €' : '—'; },
    set: function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; },
    bind: function (formId, fn) {
      var f = document.getElementById(formId); if (!f) return;
      f.addEventListener('input', fn); f.addEventListener('change', fn);
      f.addEventListener('submit', function (e) { e.preventDefault(); fn(); });
      fn();
    }
  };
})();
