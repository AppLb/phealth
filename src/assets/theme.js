// pHealth — тема до отрисовки страницы, чтобы не мигало.
// Выбор посетителя хранится в localStorage, иначе берём тему системы.
(function () {
  var r = document.documentElement, t = null;
  try { t = localStorage.getItem("ph-theme"); } catch (e) {}
  if (t === "light" || t === "dark") r.dataset.theme = t;
  r.dataset.mode = t || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
})();
