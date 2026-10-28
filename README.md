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
