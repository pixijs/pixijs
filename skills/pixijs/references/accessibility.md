# accessibility

Screen readers and keyboard navigation: the `AccessibilitySystem` overlay, per-container properties, when an element appears, tab order, and activation events.

The system puts an invisible DOM overlay over the canvas with one element (a `<button>` by default) per accessible container, so assistive technology can discover and activate them.

```ts
const button = new Sprite(await Assets.load("button.png"));
button.accessible = true;
button.accessibleTitle = "Play game"; // without title or hint, screen readers hear "container 0"
button.accessibleHint = "Starts a new game session";
button.eventMode = "static"; // tabIndex is applied and activation listeners fire
button.tabIndex = 0;
app.stage.addChild(button);

app.renderer.accessibility.setAccessibilityEnabled(true); // otherwise nothing exists until Tab is pressed

button.on("pointertap", () => startGame());
```

The system needs the main thread (not available in a Web Worker) and exists only on the WebGL and WebGPU renderers: with `preference: "canvas"`, `app.renderer.accessibility` is undefined. With `skipExtensionImports: true`, add `import "pixi.js/accessibility"` or it is undefined too.

## Container properties

- `accessible` (boolean): gives this container an overlay element; no `eventMode` is required for the element to exist.
- `accessibleTitle`: the element's `title` attribute.
- `accessibleHint`: the `aria-label` attribute.
- `accessibleText`: the element's text content (`innerText`).
- `accessibleType`: HTML tag for the element, default `'button'` (e.g. `'div'`).
- `tabIndex` (default `0`): copied to the element only when `eventMode` is `'static'` or `'dynamic'`; otherwise the element gets `0`.
- `accessibleChildren` (default `true`): when `false`, neither this container nor anything below it gets an element.
- `accessiblePointerEvents`: CSS `pointer-events` value on the element.

Title, hint, text and `tabIndex` are copied only when the element is created. Changing them later (relabelling a score, reordering) does nothing until the element is recreated: set `accessible = false`, render once, then set it back to `true` (or deactivate and re-activate the system).

With neither `accessibleTitle` nor `accessibleHint`, the element's title is `"container {tabIndex}"`, using the `tabIndex` you set on the container (`container 3` for `tabIndex = 3`), even when the element's own `tabIndex` is reset to `0` because `eventMode` is not `'static'`/`'dynamic'`. Screen readers announce that generic label, so set at least `accessibleTitle`.

## When no element appears

An element exists for an `accessible` container only when all of these hold:

- The system is active: Tab was pressed (or, on mobile, screen-reader focus reached the hidden touch hook, which activates it for the whole session), `enabledByDefault: true`, or `setAccessibilityEnabled(true)`; and on desktop it has not been switched off again by a mouse move (`deactivateOnMouseMove`, default `true`). Automated accessibility tests find nothing until one of these happens.
- The container is in the scene last rendered to the screen (normally `app.stage`), and the overlay has been updated since it was added: that happens after every render to the screen and once when the system activates. Rendering to a texture does not update it.
- Neither the container nor any ancestor has `visible = false` or `accessibleChildren = false`. (`renderable = false` and `alpha = 0` do not hide it.)
- The canvas is attached to the document; activation waits until it is.

The element is removed on the next render after any of these stops holding.

## System options

```ts
await app.init({
  accessibilityOptions: {
    enabledByDefault: true, // activate immediately (default: false)
    debug: true, // makes overlay divs visible (default: false)
    activateOnTab: true, // Tab key activates system (default: true)
    deactivateOnMouseMove: false, // stay active when the mouse moves (default: true)
  },
});
```

Pass them in the single `init` call, or set static defaults before creating the Application (`AccessibilitySystem.defaultOptions.enabledByDefault = true`). At runtime: `app.renderer.accessibility.setAccessibilityEnabled(true)`, and read `isActive` / `isMobileAccessibility`. With the default `deactivateOnMouseMove: true`, any mouse movement after Tab activation turns the overlay off, which makes testing with a mouse confusing.

## Tab order

Browser rules apply: positive `tabIndex` values come first in ascending order, then every `0` element; equal values follow the DOM order of the elements (normally the order they were created). Every container in the order needs `eventMode` `'static'`/`'dynamic'`, or its element gets `tabIndex` `0` and the order you set is ignored:

```ts
for (const [i, b] of [menuButton, playButton, settingsButton].entries()) {
  b.accessible = true;
  b.eventMode = "static";
  b.tabIndex = i + 1;
}
```

## Activation events

When a user activates an element (Enter/Space or a screen-reader click), the system dispatches `click`, `pointertap` and `tap` to the container, then bubbles them to its ancestors. Focus dispatches `mouseover`, focus-out dispatches `mouseout`. Listeners run only on containers with `eventMode` `'static'` or `'dynamic'`, so a passive accessible container shows an element but its handlers never fire.

These are plain `FederatedEvent`s, not pointer events: `event.global`, `button` and `pointerType` are undefined. A handler shared with mouse input must not read pointer fields unguarded:

```ts
declare const button: Sprite;
declare function submitForm(x?: number): void;

button.on("pointertap", (e) => {
  const x = e.global?.x; // undefined for keyboard / screen-reader activation
  submitForm(x);
});
```
