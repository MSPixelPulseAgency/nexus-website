import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { courses } from "../src/data/catalog.js";
import { COURSE_TUITION_CENTS, formatTuition } from "../src/data/tuition.js";

const catalogBytes = readFileSync(new URL("../server/payments/catalog-prices.json", import.meta.url));
const prices = JSON.parse(catalogBytes);
const manifest = JSON.parse(readFileSync(new URL("../dist/tuition-manifest.json", import.meta.url)));
assert.equal(courses.length, 207, "Expected the complete Nexus catalogue");
assert.equal(Object.keys(prices).length, courses.length, "Server course count differs");
assert.equal(COURSE_TUITION_CENTS, 49900, "Standard tuition must be CAD 499.00");
for (const course of courses) {
  assert.equal(course.priceCents, COURSE_TUITION_CENTS, `Frontend tuition: ${course.code}`);
  assert.deepEqual(prices[course.code], { amount: COURSE_TUITION_CENTS, label: course.title }, `Server tuition: ${course.code}`);
}
assert.deepEqual(manifest, { currency: "CAD", amount: 49900, courseCount: 207,
  catalogueSha256: createHash("sha256").update(catalogBytes).digest("hex") }, "Public/private release pricing differs");
assert.equal(formatTuition(), "CA$499");
assert.equal(formatTuition(99800), "CA$998");
assert.equal(formatTuition(49901), "CA$499.01");
console.log("PASS: all 207 course prices and the public/private release fingerprint match CAD 499.00.");
