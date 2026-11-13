// pHealth — общий скрипт: мобильное меню и переключатель темы в шапке.
(function () {
  var btn = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  if (!btn || !menu) return;
  function set(open) {
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }
  btn.addEventListener("click", function () { set(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();


// Переключатель темы. Начальную тему ставит assets/theme.js в <head>.
(function () {
  var r = document.documentElement, b = document.getElementById("theme");
  if (!b) return;
  var mq = matchMedia("(prefers-color-scheme: dark)");
  function label() {
    var dark = r.dataset.mode === "dark";
    b.setAttribute("aria-label", dark ? "Включить светлую тему" : "Включить тёмную тему");
    b.setAttribute("aria-pressed", dark);
  }
  b.addEventListener("click", function () {
    var m = r.dataset.mode === "dark" ? "light" : "dark";
    r.dataset.theme = m; r.dataset.mode = m; label();
    try { localStorage.setItem("ph-theme", m); } catch (e) {}
  });
  mq.addEventListener("change", function (e) {
    if (!r.dataset.theme) { r.dataset.mode = e.matches ? "dark" : "light"; label(); }
  });
  label();
})();
