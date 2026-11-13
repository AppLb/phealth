// Настройки сборки сайта pHealth.
// Исходники лежат в src/, готовый сайт собирается в _site/.

export default function (eleventyConfig) {
  // Файлы, которые копируются как есть
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  // Старые адреса, которые перенаправляют на новые
  eleventyConfig.addPassthroughCopy("src/kalkulyator");
  eleventyConfig.addPassthroughCopy("src/o-nas");
  eleventyConfig.addPassthroughCopy("src/monitor-co2");

  // Относительная ссылка от текущей страницы: rel("/about/", page.url) -> "../about/".
  // Сайт целиком на относительных ссылках, чтобы работать с любого адреса.
  eleventyConfig.addFilter("rel", function (to, from) {
    from = from || (this.page && this.page.url) || "/";
    const i = to.indexOf("#");
    const path = i === -1 ? to : to.slice(0, i);
    const hash = i === -1 ? "" : to.slice(i);
    if (path === from) return hash || "./";
    const depth = from.split("/").filter(Boolean).length;
    const rel = "../".repeat(depth) + path.replace(/^\//, "");
    return (rel || "./") + hash;
  });

  // Дата заметки: «18 сентября»
  const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  eleventyConfig.addFilter("ruDay", (d) => `${d.getUTCDate()} ${months[d.getUTCMonth()]}`);
  eleventyConfig.addFilter("ruDate", (d) => `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`);

  // Заметки журнала — новые сверху
  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*.md").sort((a, b) => b.date - a.date)
  );

  // ---------- Шорткоды для статей ----------
  const levels = { 4: "Сильные", 3: "Умеренные", 2: "Ограниченные", 1: "Не подтверждено" };
  const bar = '<span class="m"><b></b><b></b><b></b><b></b></span>';

  // Метка доказательности в тексте: {% ev 4 %} или {% ev 4, "Сильные · при дефиците" %}
  eleventyConfig.addShortcode("ev", (l, text) =>
    `<span class="ev" data-l="${l}">${bar}${text || levels[l]}</span>`
  );

  // Утверждение с меткой в статье:
  // {% claim 4 %}Текст утверждения.{% ref 7 %}{% endclaim %}
  eleventyConfig.addPairedShortcode("claim", (body, l) =>
    `<p class="claim" data-l="${l}"><span class="ev" data-l="${l}" role="button" tabindex="0">${bar}${levels[l]}</span>${body.trim()}</p>`
  );

  // Сноска на источник: {% ref 7 %} — номер в списке sources статьи
  eleventyConfig.addShortcode("ref", (n) => `<sup><a href="#s${n}">${n}</a></sup>`);

  // Пояснение под заголовком раздела: {% ctx %}Когда уровень в крови низкий.{% endctx %}
  eleventyConfig.addPairedShortcode("ctx", (body) => `<p class="ctx">${body.trim()}</p>`);

  // Врезка: {% note "Коротко." %}Текст{% endnote %}
  // Спорное место: {% note "Спорное место: …", "dispute" %}Текст{% endnote %}
  eleventyConfig.addPairedShortcode("note", (body, title, kind) =>
    `<div class="note${kind ? " " + kind : ""}"><b>${title}</b> ${body.trim()}</div>`
  );

  // Заголовки ## в статьях получают класс s — так они оформлены в стилях статьи
  eleventyConfig.amendLibrary("md", (md) => {
    md.renderer.rules.heading_open = (tokens, i, opts, env, self) => {
      if (tokens[i].tag === "h2") tokens[i].attrJoin("class", "s");
      return self.renderToken(tokens, i, opts);
    };
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
}
