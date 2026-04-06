# Changelog

All notable changes to ORB ARKANOID are documented here.

---

## [1.8.0] — 2026-04-07

### Added
- **Акселерометр** — управление платформой наклоном телефона. Калибровка нулевого положения происходит автоматически при запуске шарика. Android работает сразу; iOS 13+ запрашивает разрешение при первом касании
- **Настройки в меню паузы** — быстрый доступ к Music, Sound, Visual FX и сложности прямо из паузы без выхода в главное меню. Синхронизированы с основными настройками
- **Мобильная адаптация UI** (`@media pointer:coarse`) — увеличены все кнопки до минимума 44×44px (Apple HIG), сетка выбора уровней 5→3 колонки, крупнее иконки пауэрапов и кнопки оверлеев

### Fixed
- **Бот на фоне** — `updateDebugBot()` продолжал работать после выхода в главное меню. Добавлена проверка `currentScreen === 'screen-game'`

---

## [1.7.1] — 2026-04-07

### Fixed
- **Таймер в TIMED режиме** — корневая причина: `gameCtx` не был определён нигде в коде, что вызывало ReferenceError в `render()` каждый кадр в strict mode. Из-за краша `renderTimerHUD()` никогда не выполнялся, таймер выглядел замороженным
- **Баг `var ctx = ctx`** — в функциях `renderFloatTexts`, `renderBallTrajectory`, `renderShield` была строка `var ctx = ctx`, создававшая локальную переменную, которая затеняла глобальную (hoisting + TDZ). Удалены, функции теперь используют глобальный `ctx` напрямую
- **Таймер запускается только при старте игры** — перенесён из `startLevel()` в `dismissLevelOverlay()`. Останавливается при потере жизни, паузе, выходе и смене экрана
- **Прерывание стека Canvas ctx** — `ctx.save()` в `render()` никогда не достигал `ctx.restore()` из-за краша. Исправлено вместе с gameCtx

### Changed
- **Aimline (трассировка шарика)** теперь отображается только при включённом режиме хитбоксов (кнопка DBG-HITBOX), а не при любом Debug mode
- **Пауэрап `time`**: убран из пула в Classic и Endless режимах (в не-TIMED режиме собранный time-пауэрап ничего не делал); в TIMED вероятность снижена с 35% до 20%
- **Бот**: добавлена пауза 2.5 секунды перед автопереходом к следующему уровню после победы
- **Взрывы стали тише**: `spawnSupernovaLite` (блоки Lava/Boss) — частиц 18→14, скорость 100–360→60–190, shake 16→8, вспышка 40→20%; `spawnSupernova` (финал) — частиц 32→24, скорость 120–500→80–260, shake 22→12, вспышка 65→35%
- Убрана текстовая метка **STK** с визуала пауэрапа Sticky (hexagon+web дизайн достаточно читаем)

---

## [1.6.0] — 2026-04-05

### Added
- **Active liquid waves**: All orb types now have visible, animated liquid surface (Fire amp 4.5, Ice amp 2.5, Earth amp 3.0, Lava amp 6.5 — previously Ice/Earth were frozen)
- **Ambient orb excitation**: Alive orbs receive random micro-impulses so liquid never fully settles between hits
- **Orb shatter sequence**: On destruction, orb now shatters into 8-12 debris fragments first; liquid spill + WebGL drain begin 0.18s later (previously liquid poured immediately)
- **Per-effect paddle visuals** (each powerup uniquely transforms the paddle appearance):
  - Expand: green side wing chevrons extending outward
  - Shrink: pink inward compression brackets on sides
  - Fireball: orange flame jets beneath the paddle body
  - Sticky: purple adhesive tendrils reaching up from top edge
  - Slow: two expanding blue ellipse ripples around the paddle
  - Ice Ball: cyan ice crystal spikes on top surface
  - Gold Ball: golden arc halo + 4 orbiting sparkle dots
  - Lava Ball: lava glow blobs on both sides + pulsing drip
  - Laser: dual mechanical turret barrels on top (existing)

---

## [1.5.0] — 2026-04-05

### Added
- **Futuristic paddle**: Trapezoid dark body, glowing top edge (color changes per active effect), 5 pulsing LED dots, spinning diamond central node. Replaces old orange rounded rectangle
- **Unique powerup shapes**: Each of 11 powerups now has a distinct canvas-drawn visual:
  - Expand: wide horizontal pill + ◄► arrows
  - Shrink: tall narrow pill + ▲▼ arrows
  - Fireball: 6-spike rotating sun
  - Multiball: 3 orbiting mini-balls around a core
  - Sticky: spinning hexagon with web lines
  - Laser: rotating diamond + 4 beam pulses
  - Life: heart shape with radial gradient
  - Slow: clock face with rotating hand
  - Ice Ball: animated snowflake / ice crystal
  - Gold Ball: 5-point gold star
  - Lava Ball: animated lava drop / teardrop
- **3 new orb-type powerups** (from Gold, Ice, Rainbow drops):
  - **Ice Ball** (ICE, 10s): every hit also damages all adjacent orbs with ice wave
  - **Gold Ball** (AU, 12s): all block scores ×3 while active
  - **Lava Ball** (LAV, 8s): ball deals 2 hp per hit instead of 1
- **Steel orbs are now breakable** (hp: 5 instead of 999). Destroying steel always drops a powerup. Steel now counts toward level completion
- **Powerup rate setting**: Settings → POWER-UPS: FEW / NORMAL / MANY (6% / 14% / 28% drop rate)
- **Danger zone** red border removed from screen edge (red gradient bottom glow remains)
- **Level 3 redesigned**: Steel-only walls replaced with steel battlements at corners, fire+TNT+lava interior

### Fixed
- Level-clear check now includes steel blocks
- Steel orbs in blast/chain radius now take damage (previously immune)
- Steel liquid spill effect on destruction (silver drops)

---

## [1.4.0] — 2026-04-04

### Added
- **Flying ball fire aura**: Ball is now engulfed in flames/lava/plasma/ice effect while flying (not only when stuck). `_spawnBallAura()` called every frame for moving balls
- **FEVER MODE** (WOW 10/10): Hit 5 blocks in 2 seconds → 6s fever: ball speed ×1.4, score ×3, pulsing white glow ring, "F E V E R !" HUD overlay, screen flash + shake
- **Grid descends** (WOW 9/10): After 20s of play, blocks slowly crawl down (3–8 px/s, accelerates over time). Red alarm border pulses when blocks are in danger zone. Blocks touching paddle = lose a life
- **Orbs shoot back** (WOW 8/10): Fire/Lava/TNT orbs periodically shoot projectiles downward. Ice orbs freeze the paddle for 3s. TNT fires in random direction
- **Rage mode** (WOW 7/10): Every 25s ball speeds up ×1.08 (stacks up to ×1.8), "⚡ SPEED UP!" flash, longer trail
- **Danger zone** (WOW 6/10): Red gradient + pulsing border when ball drops below 75% screen height. Screen shake when ball is critical

### Fixed
- Frozen paddle visual: ice-blue border + tint overlay when `_paddleFrozen > 0`
- Rage trail length: trail grows longer with each rage level
- FEVER/SPEED UP text now localized via i18n (EN: "F E V E R !" / RU: "Л И Х О Р !"; EN: "⚡ SPEED UP!" / RU: "⚡ УСКОРЕНИЕ!")

### Levels (complete redesign — all 15 levels now dense & action-packed)
- Every level is now 100% filled (no empty half-rows), each row exactly 13 blocks
- Level 2 Frost Bite: ice fortress with water moat and earth pillars
- Level 3 Fortress Wall: steel battlements + fire interior + TNT explosive row
- Level 4 Gold Rush: solid gold+rainbow carpet with fire streaks
- Level 5 TNT Minefield: earth matrix dense with TNT + lava, all-TNT last row
- Level 6 Ice Palace: full ice with water fountains + steel pillars
- Level 7 Lava Forge: steel frame + wall-to-wall lava with fire seams
- Level 8 Checkered: Fire/Ice/Rainbow triple-rotation (no more plain FI checkerboard)
- Level 9 Gauntlet: steel+lava+fire maze with TNT traps
- Level 10 Rainbow Road: full rainbow carpet, gold lanes, fire accents
- Level 11 Earth Quake: escalating earth→fire→TNT+lava→full lava eruption
- Level 12 Twin Fortress: mirrored steel+lava+fire towers
- Level 13 Inferno Core: wall-to-wall lava+fire+TNT, no mercy
- Level 14 Labyrinth: steel+gold maze with water+rainbow traps
- Level 15 Final Eruption: max density — lava+gold+TNT+fire+rainbow total chaos

### Liquid Spill Effect
- New `spawnLiquidSpill(cx,cy,orbR,type)`: 20 downward stream drops + 9 radial burst particles
- New particle type `'liquid'`: rendered with `source-over` (opaque, not additive) for realistic drops
- Each drop has a small specular highlight for extra realism
- Colors match orb type: Fire=orange, Ice=blue, Water=blue, Earth=brown, Lava=dark red, Gold=yellow, TNT=amber, Rainbow=multicolor
- Called on every non-Steel orb destruction, independent of WebGL drain animation

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
