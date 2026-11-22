# events

Pointer, mouse, touch and wheel input: `eventMode`, event types, propagation, hit testing and `hitArea`, drag, cursors, wheel, `eventFeatures`.

```ts
declare const button: Sprite;

button.eventMode = "static"; // default 'passive' never fires its own listeners
button.cursor = "pointer"; // v7's buttonMode = true
button.on("pointertap", (e) => console.log(e.global.x, e.global.y));
```

Listen with `.on()` / `.once()` / `.off()`, `addEventListener(type, fn, { once, capture })`, or property handlers (`onclick = ...`).

## eventMode

| Value | Behaviour |
| --- | --- |
| `'none'` | No interaction; the whole subtree is skipped by hit testing. |
| `'passive'` | Default. Its own listeners never fire; interactive children still work. |
| `'auto'` | Hit tested only when a parent is interactive. |
| `'static'` | Receives events. Use for buttons, UI, drag targets. |
| `'dynamic'` | Like `'static'`, plus synthetic events from the ticker while the pointer is stationary; only for objects that move under a still cursor and need continuous hover updates. |

A container with no `eventMode` of its own uses the global default from `app.init({ eventMode })` (`'passive'` if omitted). `app.init({ eventMode: "static" })` makes every container, `app.stage` included, interactive; it is one global value, so the last `init` wins. `isInteractive()` is true for `'static'` and `'dynamic'`. Legacy `interactive = true` is an alias for `'static'`.

## Event types

- **Which click fires**: `click` (and `rightclick`) only for mouse, `tap` only for touch, and nothing but `pointertap` for pen. Use `pointertap` for buttons. `pointertap` fires for every pointer type and every button, right button included; check `e.button === 0` if a right-click must not trigger it.
- **Double click**: there is no `dblclick` event. On `pointertap` or `click`, `e.detail` counts consecutive clicks of the same button on the same target, each within 200 ms of the previous one, so `e.detail === 2` is a double click.
- **Move events fire only over the object** in v8 (`pointermove`, `mousemove`, `touchmove`; in v7 they fired on any canvas move). `globalpointermove`, `globalmousemove` and `globaltouchmove` fire on every pointer movement (also outside the canvas) regardless of whether the pointer is over the listening object, but only for listeners that are interactive and reachable on the rendered stage (not under an `eventMode = 'none'`, invisible or `renderable = false` ancestor).
- **Context menu**: PixiJS doesn't block the browser's context menu; call `event.preventDefault()` in a `contextmenu` listener to keep it closed. Canceling `rightdown`, `rightup`, or `rightclick` doesn't keep it closed. On macOS, ctrl + click also fires `contextmenu`, and the browser can report it as a left click.
- **Touch** events (`touchstart`, `touchend`, `touchendoutside`, `touchmove`, `touchcancel`, `tap`) carry `altKey`, `ctrlKey`, `metaKey` and `shiftKey` copied from the native `TouchEvent`.
- **Names**: `pointerdown`/`up`/`upoutside`/`move`/`over`/`out`/`enter`/`leave`/`tap`/`cancel`; `mousedown`/`up`/`upoutside`/`move`/`over`/`out`/`enter`/`leave`, `click`, `rightdown`, `rightup`, `rightupoutside`, `rightclick`, `contextmenu`, `wheel`.
- **Capture phase**: append `capture` to the name (`pointerdowncapture`, `clickcapture`) or pass `{ capture: true }` to `addEventListener`; capture listeners run before the event reaches its target, and `stopImmediatePropagation()` there blocks the children.
- Container lifecycle events (`added`, `removed`, `destroyed`, `childAdded`, `childRemoved`, `visibleChanged`) need no `eventMode`; see [scene-container](scene-container.md#container-events).

## Propagation

Events bubble from the target up through its ancestors, but a listener runs only if its own container is `'static'` or `'dynamic'`: propagation skips the listeners of a non-interactive `currentTarget` and continues to the next ancestor, so a passive container between the target and an interactive grandparent neither fires nor blocks. Event delegation on a parent needs the parent itself interactive:

```ts
declare const menu: Container, item: Sprite;
declare function select(target: Container): void;

menu.eventMode = "static"; // left 'passive', menu's listener never fires
item.eventMode = "static";
menu.addChild(item);
menu.on("pointertap", (e) => select(e.target));
```

The `target` of an event is the deepest interactive object under the pointer; a passive child of an interactive parent makes the parent the target. `stopPropagation()` keeps ancestors from receiving it.

## Hit testing

PixiJS walks the tree for the top-most interactive object under the pointer:

- `eventMode = 'none'` skips that element and its entire subtree; `interactiveChildren = false` skips only its children (the container itself can still be tested). Both also cut hit-test cost on large subtrees.
- Without a `hitArea`, the test is the object's own geometry (`containsPoint`): a Graphics' drawn shapes, a Sprite's texture rectangle. Bounds are not used.
- A plain `Container` has no geometry: an interactive Container is hit only where one of its children is (gaps between children miss). Give it a `hitArea` to make its empty space clickable.
- A `hitArea` replaces the geometry test and also clips the subtree: children outside the parent's `hitArea` are never hit. Masks clip hit testing too.
- Objects with `visible = false` or `renderable = false` (and their subtrees) are skipped; `alpha = 0` objects are still hit.
- Hit testing uses the transforms from the last render.

`app.stage` is a plain Container with `eventMode = 'passive'`. To receive clicks on empty canvas areas, set `app.stage.eventMode = "static"` and `app.stage.hitArea = app.screen`.

A `hitArea` is in the object's local coordinates and is cheaper than the geometry test on complex objects. Any shape from [math](math.md#shapes-and-hit-testing) works, or any object with `contains`:

```ts
sprite.hitArea = new Circle(50, 50, 40);
sprite.hitArea = {
  contains(x: number, y: number): boolean {
    return x >= 0 && x <= 100 && y >= 0 && y <= 100;
  },
};
```

## Drag

```ts
import { Application, FederatedPointerEvent, Graphics, Point } from "pixi.js";

declare const app: Application;

const card = new Graphics().roundRect(0, 0, 120, 80, 8).fill(0x2266aa);
card.position.set(40, 260);
card.eventMode = "static";
card.cursor = "pointer";
app.stage.addChild(card);

const grab = new Point();
let dragging = false;

card.on("pointerdown", (e: FederatedPointerEvent) => {
  const p = card.parent?.toLocal(e.global); // parent is Container | null: strict TS needs ?.
  if (!p) return;
  grab.set(card.x - p.x, card.y - p.y); // keep the offset where it was grabbed
  dragging = true;
});

// fires for every move, even when the pointer leaves the card or the canvas
card.on("globalpointermove", (e: FederatedPointerEvent) => {
  if (!dragging) return;
  const p = card.parent?.toLocal(e.global);
  if (p) card.position.set(p.x + grab.x, p.y + grab.y);
});

const stop = () => {
  dragging = false;
};
card.on("pointerup", stop);
card.on("pointerupoutside", stop); // released outside the card, including outside the canvas
```

- `event.global` is in canvas (stage) space; `position` is in the parent's space. Convert with `parent.toLocal(e.global)`; assigning `e.global` to `position` is only right when every ancestor has an identity transform.
- `container.parent` is `Container | null`, so strict TypeScript rejects `card.parent.toLocal(...)`; guard it (`?.`) or use a parent you hold a typed reference to.
- `pointermove` would stop firing as soon as a fast move leaves the object; use `globalpointermove`.

## Cursors

The cursor shown is the `cursor` of the event target (the deepest interactive object under the pointer). `parent.cursor = "pointer"` applies over the parent's non-interactive (passive) children, but an interactive child without its own `cursor` shows the default cursor, so give each interactive child its own `cursor`. Gaps between children are only covered if the parent itself is hit there: give the parent a background child or a `hitArea`.

Register reusable named cursors on the event system:

```ts
app.renderer.events.cursorStyles.default = "url('bunny.png'), auto";
app.renderer.events.cursorStyles.hover = "url('bunny_saturated.png'), auto";
sprite.cursor = "hover";
```

A cursor style is a string (CSS cursor value), an object (applied as CSS styles), or a function (called with the mode string).

## Event objects

`FederatedPointerEvent` carries `global` (scene space), `client` (CSS pixels relative to the viewport), `target`, `currentTarget`, `pointerType` (`'mouse' | 'pen' | 'touch'`), `pointerId`, `isPrimary`, `pressure`, `button` (0 left, 1 middle, 2 right), `buttons` (bitmask), the modifier keys, and `nativeEvent` (the DOM `PointerEvent` / `MouseEvent` / `Touch`). `offset` is not supported at the moment, and `persistentDeviceId` is always 0 (present for DOM `PointerEvent` type compatibility).

Event objects (and their `global`, `client` points) are reused for later events. Copy what you keep past the handler: `start.copyFrom(e.global)` or `e.global.clone()`, never `start = e.global`.

## Wheel

`FederatedWheelEvent` adds `deltaX`, `deltaY`, `deltaZ` and `deltaMode`. Wheel events fire on the same hit-tested object as pointer events (over empty canvas only if `app.stage` has a `hitArea`). PixiJS registers its wheel listener as passive, so `e.preventDefault()` in a wheel handler cannot stop the page from scrolling; add a native listener for that:

```ts
app.canvas.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
```

## Event features

Turn off categories you don't use to cut per-frame work:

```ts
await app.init({
  eventFeatures: {
    move: true, // pointer/mouse/touch move events
    globalMove: true, // globalpointermove, etc.
    click: true, // click/tap/press and contextmenu events
    wheel: true,
  },
});

app.renderer.events.features.globalMove = false; // or after init
```
