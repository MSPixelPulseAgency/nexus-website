import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { blogs, courses } from "../src/data/catalog.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = "https://nexuseps.com";
const staticRoutes = [
  "/", "/about", "/about/team", "/why-nexus", "/courses", "/courses/grade-9", "/courses/grade-10",
  "/courses/grade-11", "/courses/grade-12", "/admissions", "/student-support",
  "/academic-planning", "/online-learning", "/blog", "/reviews", "/inquiry", "/contact",
  "/faq", "/understanding-course-codes", "/ossd-requirements", "/university-planning",
  "/college-planning", "/parent-guardian-guide", "/credit-recovery", "/upgrade-courses",
  "/adult-education", "/mature-students", "/ossd", "/ouac", "/ocas", "/resources", "/student-resources/videos",
  "/enroll", "/policies", "/privacy", "/terms", "/accessibility",
];
const routes = [
  ...staticRoutes,
  ...courses.map((course) => `/courses/${course.slug}`),
  ...courses.map((course) => `/courses/${course.slug}/outline`),
  ...blogs.map((post) => `/blog/${post.slug}`),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${base}${route === "/" ? "/" : route}</loc></url>`).join("\n")}
</urlset>
`;

mkdirSync(resolve(root, "public"), { recursive: true });
writeFileSync(resolve(root, "public/sitemap.xml"), xml);
console.log(`Generated sitemap with ${routes.length} URLs.`);
