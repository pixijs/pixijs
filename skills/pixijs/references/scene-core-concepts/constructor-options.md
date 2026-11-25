# constructor-options

The options object every `Container` subclass accepts, and the options that misbehave when passed there.

v8 constructors take one options object: prefer `new X({ ... })` over assigning properties line by line, except for values computed after construction (`app.screen` sizes), properties whose runtime change is the point, and objects received from elsewhere. v7 constructor patterns: [migration-v8](../migration-v8.md).

```ts
const group = new Container({
  x: 100,
  y: 200,
  scale: 2, // number or PointData; also pivot and origin
  skew: { x: 0, y: 0 }, // radians; PointData only, like position
  angle: 45, // degrees; rotation is radians
  alpha: 0.8,
  tint: 0xff8800,
  blendMode: "add",
  label: "world",
  children: [background, player],
  isRenderGroup: true,
  zIndex: 10,
  boundsArea: new Rectangle(0, 0, 800, 600),
  filters: new BlurFilter(2), // one filter or an array
  mask: maskGraphics,
  onRender: (renderer) => {},
});
```

The constructor copies every field of the options object onto the instance except `children`, `parent` and `effects`, so any public property is a valid option. Event options (`eventMode`, `hitArea`, `cursor`, `interactiveChildren`, `on*` handlers), accessibility options (`accessible*`, `tabIndex`) and culling options (`cullable`, `cullArea`, `cullableChildren`) are mixed into `ContainerOptions` too; they are documented in [events](../events.md), [accessibility](../accessibility.md) and [performance](../performance.md).

## Options with non-obvious behaviour

- `children`: added with `addChild` after construction. `parent`: the new node is added to it during construction. `label` (default `null`): the key for `getChildByLabel` / `getChildrenByLabel`.
- `width` / `height`: set `scale` from the bounds measured at construction. On a plain `Container`, options are applied before `children` are added, so `new Container({ width: 200, children: [g] })` measures nothing and leaves scale at 1. The same applies to a `Graphics` drawn after construction. Call `setSize()` after the content exists. `Sprite` is the exception: it applies `width` / `height` after its texture is set.
- `boundsArea`: `getBounds()` returns this rectangle instead of measuring every child.
- `sortableChildren` (default `false`) is set automatically when a child gets a non-zero `zIndex`; see [scene-container](../scene-container.md#zindex-and-sortablechildren).
- `visible` / `renderable` differ in what they keep (bounds, hit testing, accessibility); see the hiding table in [scene-container](../scene-container.md#hiding).
- `filters` (default `null`) work on WebGL/WebGPU only. `mask` takes a `Container`, a number (`ColorMask`) or `null`, and picks stencil/alpha/color mask by type.
- `onRender` is called each render while attached to the rendered scene, even when invisible.
- `cacheAsTexture`: never pass it in options. It is a method; `cacheAsTexture: true` is a type error, and at runtime it overwrites the method with the boolean so a later `container.cacheAsTexture(false)` throws. Call `container.cacheAsTexture(true)` after construction.
- `setMask` is typed on `EffectsMixinConstructor` but is also a method, not data. Use `mask: ...` in options or call `setMask(...)` later.
- `interactive`: a convenience boolean for `eventMode`; `true` sets `eventMode = 'static'`, `false` sets `eventMode = 'passive'`.
- `effects` is silently dropped (the constructor passes `effects: true` to `assignWithIgnore`).
- `autoGarbageCollect` (advanced, from `ViewContainerOptions`): leave at its default.
