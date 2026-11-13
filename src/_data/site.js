// Общие данные сайта: меню, подвал, строка о запуске.
// Меняете здесь — меняется на всех страницах.
export default {
  launch: "pHealth только запускается. Первый разбор уже вышел, новые статьи, чекапы и товары скоро.",

  // Пункты меню в шапке. key — то, что страница пишет в nav: в своём заголовке,
  // чтобы подсветить свой раздел.
  nav: [
    { key: "journal", href: "/#journal", label: "Журнал" },
    { key: "calculator", href: "/calculator/", label: "Калькулятор" },
    { key: "checkups", href: "/#checkups", label: "Чекапы" },
    { key: "shop", href: "/#shop", label: "Товары" },
    { key: "money", href: "/#money", label: "Как мы выбираем товары" },
    { key: "about", href: "/about/", label: "О нас" },
  ],

  footer: [
    { title: "Журнал", links: [
      { href: "/#journal", label: "Все статьи" },
      { href: "/vitamin-d/", label: "Витамин D" },
      { href: "/calculator/", label: "Калькулятор дозы" },
      { href: "/#evidence", label: "Как читать метки" },
    ]},
    { title: "Сервис", links: [
      { href: "/#checkups", label: "Чекапы" },
      { href: "/#shop", label: "Товары" },
      { href: "/#checkups", label: "Доставка и оплата" },
    ]},
    { title: "О проекте", links: [
      { href: "/about/", label: "О нас" },
      { href: "/#money", label: "Как мы выбираем товары" },
      { href: "/about/#fact-check", label: "Как мы проверяем факты" },
      { href: "/about/#contacts", label: "Контакты" },
    ]},
  ],
};
