# Changelog

All notable changes to ORB ARKANOID are documented here.

---

## [1.3.0] — 2026-04-04

### Added
- **Fullscreen ball preview** in Settings: the ball now bounces across the entire settings screen (not a small inset canvas). Click anywhere to launch; ball starts stationary with "TAP TO LAUNCH" hint
- **HITBOX toggle** in debug panel: separate `HITBOX: OFF/ON` button next to BOT, independent from debug overlay. `gameState.showHitboxes` flag controls hitbox rendering independently of debug mode

### Fixed
- Debug hitbox rectangles around falling power-ups were the "ugly square outline" reported in screenshot — now drawn as circles matching actual circular collision shape

---

## [1.2.0] — 2026-04-04

### Added
- **Ball preview** in Settings: animated mini-canvas shows the ball bouncing with current trail color and size in real time
- **TRAIL LEN setting** (S/M/L): controls trail length and fade speed
- STRINGS i18n: `trail_len` in EN/RU

### Fixed
- **Ambient fire particles** (F/L/T orbs): particles now spawn from the TOP edge of the orb and fly upward — previously they spawned in the center and were invisible against the orb's own color. Radius 2.5–6 px, speed 45–120 px/s upward, frequency 28%
- **Ambient snow/ice particles** (I orbs): larger, more visible (radius 1.5–3 px, frequency 18%)
- **Power-up sparkle lines** replaced with 8 orbiting dots with pulsing alpha — previous 4-line rotation looked like a rotating diamond/rhombus outline
- **Power-up bar icons** (bottom HUD): `border-radius: 8px` → `border-radius: 50%` — now truly circular

---

## [1.1.0] — 2026-04-04

### Added
- **TRAIL_COLORS** presets: FIRE / LAVA / PLASMA / ICE with per-color ball gradient and glow
- **TRAIL setting** in Settings panel with 4 buttons
- **Ambient fire particles** around F/L/T orbs (initial version)
- **Ambient ice/snow sparkles** around I orbs
- STRINGS i18n: `trail` in EN/RU

### Improved
- **FS_BLOCK WebGL shader**: specular highlight (sphere look), fixed premultiplied alpha bug (`col*edge` → `col`), softer edge `smoothstep(0.88→1.0)`, bottom rim darkening — orbs now look like proper 3D liquid spheres
- **Ball trail** now uses trail preset color (trail particles, shadow glow)
- **Ball gradient** changes per preset: purple for plasma, blue-white for ice
- **Ball trail particles** spawn from ball center (not bottom offset)
- **Power-up rendering**: radial gradient body, specular highlight, pulsing scale, no stroke outline

---

## [1.0.0] — 2026-04-04

### Core features complete
- **WebGL2 liquid block renderer**: circular SDF shader with 2-layer animated liquid, Catmull-Rom wave interpolation, 6-column spring wave physics
- **13 block types** across 15 levels with themed music and backgrounds
- **Circle-circle collision** for orb hitboxes (replaced circle-rect)
- **Square cell layout**: orbs tightly packed, consistent size
- **Bot AI**: aims at specific orbs (back-calculates deflection angle), 2.5× ball speed when active
- **Wave physics**: glBlockHit() impulse on collision, glBlastNeighbors() blast wave on death, drain animation on orb death
- **Liquid drain effect**: dead orbs drain for 0.48s with turbulent wave velocities
- **Full particle system**: fire, smoke, water, debris, spark, shockwave, supernova
- **8 power-up types**: expand, shrink, fireball, multiball, sticky, laser, life, slow
- **Power-ups description screen** accessible from main menu
- **Music system**: 3 themes (inferno, frost, war, arcade), dynamic intensity
- **Leaderboard** with localStorage
- **i18n** EN/RU with level names in both languages
- **Debug mode**: FPS overlay, bot panel, hitbox visualization
- **97/97 tests** passing

---

## [0.x] — Development phases (2026-04-04)

| Phase | Description |
|-------|-------------|
| Phase 1 | Playable skeleton — ball, paddle, basic blocks, 41 tests |
| Phase 2 | Block behaviors, chain reactions, particle system |
| Phase 3 | Music system, themed backgrounds, ambient particles |
| Phase 4 | Name entry overlay, supernova, debug overlay, UI polish |
| Phase 5–6 | Level speed scaling, debug hitboxes, standalone build |
| Phase 7 | WebGL2 liquid renderer, circular orbs, bot AI, wave physics |
| Phase 8 | Circle-circle collisions, power-ups redesign, i18n, settings |
