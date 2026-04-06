# Orb Arkanoid v1.8.0 — Девлог: мобилка, акселерометр и настройки в паузе

**Дата:** 7 апреля 2026
**Версия:** 1.8.0 (фича)
**Жанр:** Арканоид, WebGL2 + Canvas2D

---

## Акселерометр

Самое интересное в этом обновлении — управление наклоном телефона. Механика простая: наклоняешь телефон влево — платформа едет влево, вправо — вправо.

### Как работает калибровка

Главная проблема акселерометра в играх — «нейтральное положение». Если просто взять `gamma` (угол наклона по оси Y) и маппить его на позицию платформы, игрок вынужден держать телефон строго вертикально. Неудобно.

Решение: калибровка при запуске шарика. В момент тапа сохраняем текущий `gamma` как ноль:

```javascript
var _tiltGamma = 0, _tiltCalib = 0, _tiltActive = false;

function _tiltCalibrate() { _tiltCalib = _tiltGamma; }

function _tiltApply() {
  if (!_tiltActive || !gameState.running || ...) return;
  var tilt = _tiltGamma - _tiltCalib;
  var sens = CW / 50; // 25° наклона = половина экрана
  gameState.paddle.targetX = CW/2 + tilt * sens;
}
```

Теперь можно играть хоть лёжа — при запуске шарика текущее положение становится «прямо».

### iOS vs Android

Android: `deviceorientation` работает без разрешений, просто подписываемся.

iOS 13+: Apple добавила обязательный запрос разрешения через `DeviceOrientationEvent.requestPermission()`. Он должен вызываться **строго из обработчика пользовательского действия** (тап, клик) — иначе Promise отклоняется. Используем первый `touchstart`:

```javascript
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  document.addEventListener('touchstart', function _once() {
    document.removeEventListener('touchstart', _once);
    DeviceOrientationEvent.requestPermission()
      .then(r => { if (r === 'granted') _startTilt(); })
      .catch(() => {});
  }, { once: true });
} else {
  _startTilt(); // Android и desktop
}
```

Touch-управление при этом остаётся как резервное — оба способа работают одновременно.

---

## Настройки в меню паузы

Классическая проблема мобильных игр: хочешь выключить музыку — надо выйти из игры, открыть настройки, вернуться. Теряешь прогресс или как минимум раздражаешься.

Добавили мини-панель прямо в оверлей паузы: Music, Sound, Visual FX и выбор сложности. Кнопки синхронизированы с основным экраном настроек через общую функцию `applySettingsUI()` — состояние всегда консистентно.

Технически просто: те же `toggle-btn` и `lang-btn` классы, те же обработчики, те же `settings.*` флаги.

---

## Мобильная адаптация UI

До этого обновления интерфейс был сделан «для мыши» — кнопки 36×36px, плотная сетка уровней, мелкий текст в настройках. На телефоне попасть пальцем было сложно.

Добавили медиазапрос `@media (pointer: coarse)` — он срабатывает именно на тач-устройствах, не завязан на ширину экрана:

```css
@media (pointer: coarse) {
  .btn { padding: 18px 32px; font-size: 17px; }
  .hud-btn { width: 44px; height: 44px; } /* Apple HIG минимум */
  #level-grid { grid-template-columns: repeat(3, 1fr); } /* было 5 */
  .powerup-icon { width: 38px; height: 38px; }
}
```

`pointer: coarse` точнее чем `max-width` — ноутбук с маленьким экраном не должен получать «мобильный» UI, а планшет с широким экраном — должен.

---

## Баг: бот играл в фоне

Обнаружен забавный баг: если включить бота, потом выйти в главное меню — бот продолжал работать в фоне. На экране появлялись цифры урона поверх меню.

Причина: `updateDebugBot()` в `gameLoop` проверял `gameState.running`, но не `currentScreen`. При выходе через кнопку Quit `running` устанавливается в `false` — и бот останавливался. Но при некоторых сценариях (победа → главное меню) бот добирался до секции управления платформой раньше проверки.

Фикс — одна строка:

```javascript
function updateDebugBot() {
  if (!gameState.debugMode || !gameState.botEnabled
      || currentScreen !== 'screen-game') return; // ← добавлено
  ...
}
```

---

## Итог

v1.8.0 делает игру полноценно играбельной на телефоне. Акселерометр работает на Android сразу, на iOS — после разрешения. Настройки в паузе убирают необходимость выходить из игры ради мелких изменений.

---

**Репозиторий:** Gitea / androman / orb-arkanoid
**Build:** `build/index.html` — standalone 202 KB
