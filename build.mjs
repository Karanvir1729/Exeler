// Builds the web version of Exeler: stages the game's Lua sources and assets (never the Windows binaries or the
// screenshots), runs love.js on them in compatibility mode (no SharedArrayBuffer, so no COOP/COEP headers are
// needed on the host), then puts this repo's own index.html (page chrome, GenClass) over the generated one.
// Output: dist/ (index.html, game.js, game.data, love.js, love.wasm, theme/).

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const stage = join(root, ".build", "game");
const dist = join(root, "dist");

// What the .love package holds: main.lua at its root plus the folders it requires.
const GAME_FILES = ["main.lua", "src", "lib", "graphics", "fonts"];
const MEMORY_BYTES = 64 * 1024 * 1024; // love.js defaults to 16 MB; the maps and sprite sheets want more.

rmSync(join(root, ".build"), { recursive: true, force: true });
rmSync(dist, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
for (const f of GAME_FILES) {
  const from = join(root, f);
  if (!existsSync(from)) throw new Error(`missing ${f}`);
  cpSync(from, join(stage, f), { recursive: true });
}

const lovejs = join(root, "node_modules", ".bin", "love.js");
const r = spawnSync(lovejs, ["--compatibility", "--title", "Exeler", "--memory", String(MEMORY_BYTES), stage, dist], {
  stdio: "inherit",
});
if (r.status !== 0) throw new Error(`love.js exited with ${r.status}`);

// Our page replaces love.js's generated one; theme/love.css stays as the canvas baseline. web/ holds the page's
// script, stylesheet, favicon, link-preview image and the _headers file the Worker serves.
cpSync(join(root, "web"), dist, { recursive: true });
cpSync(join(root, "index.html"), join(dist, "index.html"));
console.log("built dist/");
