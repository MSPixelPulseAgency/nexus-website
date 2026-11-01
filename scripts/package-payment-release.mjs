// Build a reviewable Cloudways artifact. Never connects to a host or deploys.
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = process.argv[2] && resolve(process.argv[2]);
if (!output || output === root || output.startsWith(root + "/") || existsSync(output) || existsSync(output + ".tar.gz")) {
  throw new Error("Pass a new, empty release directory outside the repository.");
}
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: "inherit" });
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
if (git("status", "--porcelain")) throw new Error("Commit the reviewed work before packaging.");
const commit = git("rev-parse", "HEAD");
run("npm", ["run", "build"]);
run("npm", ["run", "test:pricing"]);
run("composer", ["test", "--working-dir=server/payments"]);
if (git("status", "--porcelain")) throw new Error("Generated release files differ from the committed source.");

mkdirSync(output, { recursive: true, mode: 0o700 });
const publicRoot = join(output, "public_html");
const privateRoot = join(output, "private_html", "nexus-payments");
cpSync(join(root, "dist"), publicRoot, { recursive: true });

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Unexpected symlink in release inputs.");
    return entry.isDirectory() ? files(path) : [path];
  });
}
// Apache uses /.routes/ so public route folders do not force Nginx redirects.
for (const path of files(publicRoot)) {
  const route = relative(publicRoot, path);
  if (!route.endsWith(".html") || route === "index.html") continue;
  const destination = join(publicRoot, ".routes", route);
  mkdirSync(dirname(destination), { recursive: true });
  renameSync(path, destination);
}
function removeEmptyDirectories(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) if (entry.isDirectory()) {
    const path = join(directory, entry.name);
    removeEmptyDirectories(path);
    if (readdirSync(path).length === 0) rmdirSync(path);
  }
}
removeEmptyDirectories(publicRoot);
mkdirSync(privateRoot, { recursive: true, mode: 0o700 });
for (const name of ["src", "vendor", "composer.json", "composer.lock", "catalog-prices.json", "config.example.php", "manage.php", "preflight.php"]) {
  const source = join(root, "server/payments", name);
  if (!existsSync(source)) throw new Error(`Missing private application input: ${name}`);
  cpSync(source, join(privateRoot, name), { recursive: true });
}
for (const route of ["checkout", "payment/success", "payment/cancel"]) {
  const html = readFileSync(join(publicRoot, ".routes", route + ".html"), "utf8");
  if (!html.includes("noindex, nofollow, noarchive")) throw new Error(`Missing payment noindex metadata: ${route}`);
}
if (files(publicRoot).some((path) => /(?:\.sqlite(?:-|$)|\/vendor\/stripe\/|\/server\/payments\/|nexus-payments-config)/.test(path))) throw new Error("Private payment material found in public release.");
const hashes = Object.fromEntries(files(output).map((path) => [relative(output, path), createHash("sha256").update(readFileSync(path)).digest("hex")]));
if (Object.keys(hashes).some((path) => /(^|\/)(\._[^/]*|\.DS_Store)(\/|$)/.test(path))) throw new Error("macOS metadata found in release inputs.");
writeFileSync(join(output, "release-manifest.json"), JSON.stringify({ commit, checkoutEnabled: false, liveLaunchApproved: false,
  pricing: JSON.parse(readFileSync(join(publicRoot, "tuition-manifest.json"))), files: hashes }, null, 2) + "\n");
writeFileSync(join(output, "INSTALL.md"), `# Disabled Nexus payment release\n\nSource commit: ${commit}\n\nThis is an artifact for review, not an authorized deployment or live launch. Public HTML and private PHP code are separated. No config, credentials or payment state are included.\n\n1. Verify the Cloudways application, PHP/cURL/PDO SQLite runtime, backups and staging approval. Keep Moodle separate.\n2. Stage public_html/ and private_html/nexus-payments/ on the approved host. Configure PHP entry points and exclude /api/payments/* from every cache.\n3. Copy config.example.php to the separate private nexus-payments-config.php, set private state_dir, HTTPS base_url and verified account identity. Keep enabled=false, cart_enabled=false, live_approved=false and pricing_approved=false. Enter secrets through the host secret mechanism only.\n4. Run the private preflight.php with --config=<absolute-private-config> --document-root=<absolute-public-root>. A pass only verifies disabled preparation.\n5. Verify HTTPS route metadata, private-file protection, sandbox webhook delivery and the management checklist in docs/stripe-payments.md from the source repository.\n6. Keep live collection disabled until management requirements and explicit launch approval are complete. Preserve database and webhook reconciliation during rollback.\n`);
// BSD tar otherwise adds AppleDouble entries for extended attributes on macOS.
execFileSync("tar", ["-czf", output + ".tar.gz", "-C", output, "."], { stdio: "inherit", env: { ...process.env, COPYFILE_DISABLE: "1" } });
const entries = execFileSync("tar", ["-tzf", output + ".tar.gz"], { encoding: "utf8" }).split("\n");
if (entries.some((path) => /(^|\/)(\._[^/]*|\.DS_Store)(\/|$)/.test(path))) throw new Error("macOS metadata found in release archive.");
chmodSync(output + ".tar.gz", 0o600);
console.log(`Prepared disabled Cloudways release for ${commit}: ${output}.tar.gz`);
