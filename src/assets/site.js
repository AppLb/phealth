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

// Понятия из словаря: {% term %} даёт ссылку с data-t (название) и data-s (коротко).
// По нажатию — карточка с объяснением и ссылкой на страницу понятия. Без скрипта ссылка просто ведёт на страницу.
(function () {
  var pop = null, cur = null;
  function close() {
    if (pop) { pop.remove(); pop = null; }
    if (cur) { cur.setAttribute("aria-expanded", "false"); cur = null; }
  }
  function open(a) {
    close();
    cur = a; a.setAttribute("aria-expanded", "true");
    pop = document.createElement("div");
    pop.className = "term-pop"; pop.setAttribute("role", "dialog");
    var b = document.createElement("b"); b.textContent = a.dataset.t;
    var p = document.createElement("p"); p.textContent = a.dataset.s;
    var more = document.createElement("a"); more.href = a.href; more.textContent = "Подробнее в словаре →";
    var x = document.createElement("button"); x.type = "button"; x.className = "x"; x.setAttribute("aria-label", "Закрыть"); x.textContent = "×";
    x.addEventListener("click", function () { var t = cur; close(); if (t) t.focus(); });
    pop.append(x, b, p, more);
    document.body.appendChild(pop);
    var r = a.getBoundingClientRect(), w = pop.offsetWidth;
    var left = Math.max(16, Math.min(r.left, document.documentElement.clientWidth - w - 16));
    pop.style.left = left + scrollX + "px";
    pop.style.top = r.bottom + scrollY + 8 + "px";
    more.focus({ preventScroll: true });
  }
  document.querySelectorAll("a.term").forEach(function (a) {
    a.setAttribute("aria-expanded", "false");
    a.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (cur === a) close(); else open(a);
    });
  });
  document.addEventListener("click", function (e) { if (pop && !pop.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && pop) { var t = cur; close(); if (t) t.focus(); } });
  // На телефоне при прокрутке прячется адресная строка и срабатывает resize: закрываем только если поменялась ширина
  var w = innerWidth;
  addEventListener("resize", function () { if (innerWidth !== w) { w = innerWidth; close(); } });
})();
