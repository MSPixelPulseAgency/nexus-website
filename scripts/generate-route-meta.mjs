import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { blogs, courses } from "../src/data/catalog.js";
import { brand, staticMeta } from "../src/data/site.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const sourceHtml = readFileSync(resolve(dist, "index.html"), "utf8");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const replaceMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`);
  return html.replace(pattern, `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`);
};

const renderMeta = ({ route, title, description }) => {
  const url = `${brand.canonical}${route === "/" ? "/" : route}`;
  const imageAlt = `${title} — ${brand.name}`;
  let html = sourceHtml.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "property", "og:image", brand.socialImage);
  html = replaceMeta(html, "property", "og:image:secure_url", brand.socialImage);
  html = replaceMeta(html, "property", "og:image:alt", imageAlt);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = replaceMeta(html, "name", "twitter:image", brand.socialImage);
  html = replaceMeta(html, "name", "twitter:image:alt", imageAlt);
  return html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
};

const routeMeta = new Map(
  Object.entries(staticMeta).map(([route, [title, description]]) => [route, { route, title, description }]),
);

for (const course of courses) {
  const route = `/courses/${course.slug}`;
  routeMeta.set(route, {
    route,
    title: `${course.title} (${course.code}) | Nexus Education Private School`,
    description: `Study ${course.code} ${course.title} with Nexus Education Private School. Review its Grade ${course.grade} ${course.type} description, prerequisite, credit details, outline and enrollment options.`,
  });
  const outlineRoute = `${route}/outline`;
  routeMeta.set(outlineRoute, {
    route: outlineRoute,
    title: `${course.code} ${course.title} Course Outline | Nexus Education`,
    description: `Review the ${course.code} ${course.title} course description, prerequisite, official curriculum link and ${course.outlineLength}-section Nexus LMS outline.`,
  });
}

for (const post of blogs) {
  const route = `/blog/${post.slug}`;
  routeMeta.set(route, { route, title: `${post.title} | Nexus Journal`, description: post.excerpt });
}

for (const metadata of routeMeta.values()) {
  if (metadata.route === "/") continue;
  const outputPath = resolve(dist, `.${metadata.route}.html`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, renderMeta(metadata));
}

console.log(`Generated route metadata for ${routeMeta.size} URLs.`);
