// Настройки сборки сайта pHealth.
// Исходники лежат в src/, готовый сайт собирается в _site/.

import fs from "node:fs";
import path from "node:path";

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

  // Статьи (страницы с шаблоном статьи) — новые сверху. Самая новая становится
  // большой карточкой в журнале на главной.
  const isArticle = (i) => i.data.layout === "layouts/article.njk";
  const byDateDesc = (a, b) => b.date - a.date;
  eleventyConfig.addCollection("articles", (api) => api.getAll().filter(isArticle).sort(byDateDesc));

  // Список журнала на главной: заметки и все статьи, кроме самой новой, по дате
  eleventyConfig.addCollection("journalList", (api) => {
    const older = api.getAll().filter(isArticle).sort(byDateDesc).slice(1);
    return [...api.getFilteredByGlob("src/notes/*.md"), ...older].sort(byDateDesc);
  });

  // Есть ли в списке материалы с такой темой — чтобы не показывать пустые вкладки
  eleventyConfig.addFilter("hasTopic", (list, topic) => list.some((i) => i.data.topic === topic));

  // Обложка статьи: файл cover.svg рядом с текстом статьи. Нет файла — запасной узор.
  eleventyConfig.addFilter("coverSvg", (inputPath) => {
    const own = path.join(path.dirname(inputPath), "cover.svg");
    return fs.readFileSync(fs.existsSync(own) ? own : "src/_includes/covers/default.svg", "utf8");
  });

  // Время чтения статьи: слова лида и текста (без шорткодов, разметки и адресов ссылок) / 180 слов в минуту
  eleventyConfig.addFilter("readMin", (inputPath) => {
    const src = fs.readFileSync(inputPath, "utf8");
    const parts = src.split(/^---\s*$/m);
    const front = parts[1] || "", body = parts.slice(2).join("---");
    const lead = (front.match(/^lead:\s*"(.*)"\s*$/m) || [])[1] || "";
    const text = (lead + " " + body)
      .replace(/\{%[\s\S]*?%\}/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*_>|`-]+/g, " ");
    const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    return Math.max(1, Math.round(words / 180));
  });

  // Сколько в статье утверждений каждого уровня: считает {% claim N %} в исходнике
  eleventyConfig.addFilter("tally", (inputPath) => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const m of fs.readFileSync(inputPath, "utf8").matchAll(/\{%\s*claim\s+(\d)/g)) counts[m[1]]++;
    return counts;
  });

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
