# Exeler
Open world RPG game created using the LOVE-2D framework and lua.
Showcases my game development skills at this point

## Screenshots
![Screenshot1](./screenshots/Screenshot-1.png)

![Screenshot2](./screenshots/Screenshot-2.png)

## Demo
[https://exeler.netlify.app/]

## How to Play
- Move around with the arrow keys or `W` `A` `S` `D`
- Use `enter` to interact with signs and NPCs
- Press `space` to use sword and `b` to use the bow

## Credits
All graphics are from OpenGameArt
- [_ArMM1998_](https://opengameart.org/users/armm1998) created the tileset
- [_Wulax_](https://opengameart.org/users/wulax) created the character sprites
- [_ansimuz_](https://opengameart.org/users/ansimuz) created the title screen background

## Web build

This checkout also builds the game for the browser with [love.js](https://github.com/Davidobot/love.js) (LÖVE 11.4,
compatibility build) and serves it from Cloudflare Workers as static assets, with [GenClass](https://genclass.dev) in
guard mode watching the page. Live: https://exeler.mehar-144.workers.dev

- `npm install` once, then `npm run build` writes `dist/`: it stages `main.lua`, `src/`, `lib/`, `graphics/` and
  `fonts/` (the Windows binaries in `game/` and the screenshots stay out), runs love.js, then copies `web/` (the page
  script, stylesheet, cover image, favicon, link-preview image and the `_headers` file with the security headers and
  the Content-Security-Policy) and `index.html` over the generated page.
- `npm run serve` serves `dist/` at http://localhost:8790; `npm run deploy` builds and deploys with wrangler
  (`wrangler.jsonc`).
- `index.html` is the page: the GenClass script tag from the project's dashboard (marked `genclass:init`; guard
  mode, analytics on, visual fixes on, the devtools overlay on every host so the badge shows at the bottom right, the
  project's public key), the header with the title-screen art, a "How to play" tip that `web/exeler.js` shows a few
  seconds after the game starts (while it is open the page behind it is locked with inline `overflow` and
  `pointer-events` styles on `body`, released when it closes), the controls and the credits. `game.js` and `love.js`
  are deferred so GenClass is installed before the game data and the wasm are requested.
- `web/genclass-config.js` runs before the GenClass tag and sets `aggressiveness: "eager"` (the model acts on weaker
  signals; the measured visual checks are unaffected).
- The GenClass dashboard for this app is the project "Exeler" in the account that created it
  (https://genclass.dev/account/apps/8a069b1bd34acd1c); `npx @genclass/runtime@beta remove` takes GenClass out again.

### Planted bugs

The commit after the web build plants five bugs in the page for the GenClass demo (`git revert` it, or `git diff`
it, to get the correct page back; each is marked "planted bug" in the source). GenClass's measured checks report all
five; with `?genclass=observe` in the URL they are reported and left as they are, and `?genclass=off` shows the raw
page. In guard, four are fixed at runtime, each undoable from the overlay's Checks tab:

| bug | where | what GenClass does in guard |
|---|---|---|
| the title's characters are nearly the page colour (`#1f1d14` on `#0b1020`, 1.1:1) | `.top h1` in `web/exeler.css` (was `var(--accent)`) | `text-invisible`: recoloured to a readable tan with an owned rule |
| the subtitle and the status line are nearly the page colour (`#1a2338`, 1.2:1) | `.tagline`, `.status` in `web/exeler.css` (were `var(--muted)`) | `text-invisible`: recoloured to `#707c95` (4.5:1) |
| once the "How to play" tip has closed the page ignores every click | `hideTip()` in `web/exeler.js` never calls `unlockPage()` | `pointer-events-leak`: the inline `pointer-events: none` on `body` is removed a few seconds after the tip closes |
| the page does not scroll to the controls | the same missing `unlockPage()` | `scroll-lock-stuck`: the inline `overflow: hidden` on `body` is removed after the first scroll attempt that moved nothing |
| the cover image in the header is broken | `src="web/cover.png"` in `index.html` (the build serves it at `cover.png`) | `image-broken`: reported with the status and the fix (the URL); a failed image is never changed at runtime |

Two things the checks cannot do: see inside the game's WebGL canvas (a collision or sprite bug in the Lua code is
invisible to them), and measure text that is outside the viewport when the page settles (a planted bug below the
fold, such as the keycaps, is not seen on a first load).
