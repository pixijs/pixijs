# Constructor options (Container-inherited)

Prefer `new X({ ... })` over line-by-line property assignment when constructing Container-derived scene nodes.

## Before / after

Line-by-line:

```ts
const hero = new Sprite(texture);
hero.x = 100;
hero.y = 200;
hero.anchor.set(0.5);
hero.scale.set(2);
hero.rotation = Math.PI / 4;
hero.alpha = 0.8;
hero.tint = 0xff8800;
hero.label = "hero";
hero.zIndex = 10;
```

Options object:

```ts
const hero = new Sprite({
  texture,
  x: 100,
  y: 200,
  anchor: 0.5,
  scale: 2,
  rotation: Math.PI / 4,
  alpha: 0.8,
  tint: 0xff8800,
  label: "hero",
  zIndex: 10,
});
```

## Exceptions (line-by-line is fine here)

- Values calculated after construction — e.g., `sprite.position.set(app.screen.width / 2, app.screen.height / 2)` needs `app` to exist first.
- Properties that change at runtime and the change is the point of the example — e.g., `sprite.tint = damageColor` in a damage-flash demo.
- Objects received from elsewhere — you can't reconstruct them through a constructor options bag.
- `point.set(x, y)` / `scale.set(sx, sy)` for multi-coordinate batches where a single call reads better than two options keys.

For v7 to v8 migration of constructor patterns, see `pixijs-migration-v8`.

## Worked example

```ts
const group = new Container({
  // Transform
  x: 100,
  y: 200,
  scale: { x: 2, y: 2 },
  rotation: Math.PI / 4,
  pivot: { x: 50, y: 50 },
  skew: { x: 0, y: 0 },
  // Display
  alpha: 0.8,
  tint: 0xff8800,
  blendMode: "add",
  visible: true,
  renderable: true,
  // Hierarchy
  label: "world",
  children: [background, player],
  // Sorting & grouping
  isRenderGroup: true,
  sortableChildren: true,
  zIndex: 10,
  // Layout & bounds
  boundsArea: new Rectangle(0, 0, 800, 600),
  // Effects
  filters: [new BlurFilter(2)],
  mask: maskGraphics,
  // Callbacks
  onRender: (renderer) => {
    /* per-frame logic */
  },
});
```

## Transform

| Option     | Type                  | Default           | Description                                                                   |
| ---------- | --------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `alpha`    | `number`              | `1`               | Opacity multiplied with parent alpha; 0 is fully transparent, 1 fully opaque. |
| `angle`    | `number`              | `0`               | Rotation in degrees. Alias for `rotation` in radians.                         |
| `origin`   | `PointData \| number` | `new Point(0, 0)` | Center of rotation and scaling without moving the node's position.            |
| `pivot`    | `PointData \| number` | `new Point(0, 0)` | Center of rotation, scaling, and skewing; reprojects position.                |
| `position` | `PointData`           | `new Point(0, 0)` | Position in parent-local coordinates.                                         |
| `rotation` | `number`              | `0`               | Rotation in radians.                                                          |
| `scale`    | `PointData \| number` | `new Point(1, 1)` | Local scale factor along each axis.                                           |
| `skew`     | `PointData`           | `new Point(0, 0)` | Skew factor in radians along each axis.                                       |
| `x`        | `number`              | `0`               | Alias for `position.x`.                                                       |
| `y`        | `number`              | `0`               | Alias for `position.y`.                                                       |

## Display

| Option       | Type          | Default    | Description                                                              |
| ------------ | ------------- | ---------- | ------------------------------------------------------------------------ |
| `blendMode`  | `BLEND_MODES` | `'normal'` | How this node composites against its target.                             |
| `renderable` | `boolean`     | `true`     | When false, skips rendering but still updates transforms.                |
| `tint`       | `ColorSource` | `0xFFFFFF` | Color multiplied into this node's output; `0xFFFFFF` is no tint.         |
| `visible`    | `boolean`     | `true`     | When false, skips both rendering and transform updates for this subtree. |

## Hierarchy

| Option     | Type        | Default | Description                                                             |
| ---------- | ----------- | ------- | ----------------------------------------------------------------------- |
| `children` | `C[]`       | `[]`    | Array of children to `addChild` after construction.                     |
| `label`    | `string`    | `null`  | Instance label used by `getChildByLabel` / `getChildrenByLabel`.        |
| `parent`   | `Container` | `null`  | Parent container; the new node is added as a child during construction. |

## Sorting & grouping

| Option             | Type      | Default | Description                                                                        |
| ------------------ | --------- | ------- | ---------------------------------------------------------------------------------- |
| `isRenderGroup`    | `boolean` | `false` | Marks this container as a render group; GPU-level transform for the whole subtree. |
| `sortableChildren` | `boolean` | `false` | Before rendering, re-sorts children by `zIndex`.                                   |
| `zIndex`           | `number`  | `0`     | Sort key used when the parent has `sortableChildren` enabled.                      |

## Layout & bounds

| Option       | Type        | Default     | Description                                                   |
| ------------ | ----------- | ----------- | ------------------------------------------------------------- |
| `boundsArea` | `Rectangle` | `undefined` | Override bounds rectangle; skips recursive child measurement. |
| `height`     | `number`    | `0`         | Requested height in pixels; internally assigns `scale.y`.     |
| `width`      | `number`    | `0`         | Requested width in pixels; internally assigns `scale.x`.      |

## Effects

| Option    | Type                          | Default | Description                                                                     |
| --------- | ----------------------------- | ------- | ------------------------------------------------------------------------------- |
| `filters` | `Filter \| readonly Filter[]` | `null`  | One filter or an array of filters applied to this subtree (WebGL/WebGPU only).  |
| `mask`    | `Container \| number \| null` | `null`  | Mask display object or mask id; picks stencil/alpha/scissor/color mask by type. |

## Callbacks

| Option     | Type                                     | Default | Description                                                        |
| ---------- | ---------------------------------------- | ------- | ------------------------------------------------------------------ |
| `onRender` | `((renderer: Renderer) => void) \| null` | `null`  | Per-frame callback invoked while this container is being rendered. |

## Advanced options and aliases

- `autoGarbageCollect` (@advanced, from `ViewContainerOptions`): leave at default unless you know why you need otherwise.
- `cacheAsTexture`: typed as a constructor option via `CacheAsTextureMixinConstructor` but is ACTUALLY A METHOD on the instance — `container.cacheAsTexture(true)`. Passing it as an options key is accepted but semantically wrong. Prefer the method.
- `setMask`: typed on `EffectsMixinConstructor` but is also a method, not data. Use `mask: ...` in options or call `setMask(...)` later.
- `interactive`: convenience boolean that maps to `eventMode`; `true` sets `eventMode = 'static'`, `false` sets `eventMode = 'passive'`. See `eventMode` for the full set of modes.
- `effects`: the `Container` constructor explicitly passes `effects: true` to `assignWithIgnore`, so passing this option is silently dropped. Not useful.

## See also

Events (`eventMode`, `hitArea`, `cursor`, `interactive*`, `on*` handlers), accessibility (`accessible*`, `tabIndex`, `accessibleTitle`, etc.), and culling (`cullable`, `cullArea`, `cullableChildren`) are ALSO valid constructor options via mixin extension on `ContainerOptions`. They are documented in their own skills: `pixijs-events`, `pixijs-accessibility`, `pixijs-performance`.
