import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import courses from "../src/data/course-summaries.js";

const tuition = JSON.parse(readFileSync(new URL("../src/data/tuition.json", import.meta.url)));
if (tuition.currency !== "CAD" || !Number.isSafeInteger(tuition.amount) || tuition.amount <= 0) throw new Error("Invalid course tuition");
const catalog = Object.fromEntries(courses.map(({ code, title }) => [code, { amount: tuition.amount, label: title }]));
if (Object.keys(catalog).length !== courses.length) throw new Error("Duplicate course codes");
const serialized = JSON.stringify(catalog, null, 2) + "\n";
writeFileSync(new URL("../server/payments/catalog-prices.json", import.meta.url), serialized);
writeFileSync(new URL("../public/tuition-manifest.json", import.meta.url), JSON.stringify({
  ...tuition, courseCount: courses.length, catalogueSha256: createHash("sha256").update(serialized).digest("hex"),
}, null, 2) + "\n");
console.log(`Generated ${courses.length} CAD ${tuition.amount / 100} payment catalogue entries.`);
