// pHealth — общий скрипт: мобильное меню в шапке.
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
