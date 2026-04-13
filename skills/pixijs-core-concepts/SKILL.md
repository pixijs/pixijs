---
name: pixijs-core-concepts
description: >
  PixiJS scene graph fundamentals. Container hierarchy, child management
  (reparentChild, replaceChild, getChildByLabel), render order, position
  (x/y), scale, rotation, angle, pivot vs origin, skew, localTransform vs
  worldTransform, setSize/getSize, alpha, tint, blendMode, visible vs
  renderable, cacheAsTexture basics, Bounds vs Rectangle, and destroy. Use when
  the user asks about the scene graph, container hierarchy, adding or removing
  children, transform properties, rotation center, pivot vs origin, visibility,
  alpha, tint, cacheAsTexture, destroying objects, or getBounds. Covers
  Container, addChild, removeChild, reparentChild, replaceChild, getChildByLabel,
  position, scale, rotation, pivot, origin, skew, setSize, visible, renderable,
  cacheAsTexture, destroy.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/scene/container/Container.ts, pixijs/pixijs:src/rendering/renderers/shared/texture/Texture.ts, pixijs/pixijs:src/__docs__/concepts/architecture.md, pixijs/pixijs:src/scene/__docs__/scene.md"
---

## When to Use This Skill

Apply when the user needs to work with the scene graph, manage parent-child relationships, set transform properties (position, scale, rotation, pivot, origin), control visibility or alpha, cache containers as textures, or destroy display objects.

**Related skills:** For sprites and anchors use **sprite**; for render order and layers use **scene-management**; for coordinate math and matrices use **math**; for vector drawing use **graphics**.

## Setup

```ts
import { Application, Container, Sprite, Texture } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

const container = new Container({ label: 'root' });
app.stage.addChild(container);

const sprite = new Sprite(Texture.WHITE);
sprite.width = 100;
sprite.height = 100;
sprite.position.set(200, 150);
container.addChild(sprite);
```

## Core Patterns

### Container as base class

Container is the base of all display objects in v8 (DisplayObject was removed). It provides transforms, alpha, tint, blendMode, visibility, and child management. Leaf nodes (Sprite, Graphics, Mesh, Text) extend Container but do not allow children.

```ts
import { Container, Sprite, Graphics } from 'pixi.js';

const parent = new Container({ label: 'ui-layer' });
const child1 = new Sprite(texture);
const child2 = new Sprite(texture);

parent.addChild(child1, child2);
parent.removeChild(child1);

// Constructor options object
const configured = new Container({
    x: 100,
    y: 50,
    scale: 2,
    rotation: Math.PI / 4,
    alpha: 0.8,
    visible: true,
});
```

### Child management

Beyond `addChild` and `removeChild`, Container provides methods for reordering, finding, and replacing children.

```ts
import { Container, Sprite } from 'pixi.js';

const parent = new Container();
const a = new Sprite(texture);
const b = new Sprite(texture);
const c = new Sprite(texture);
parent.addChild(a, b, c);

// Lookup
parent.getChildAt(0);                      // a
parent.getChildIndex(b);                   // 1
parent.getChildByLabel('player');          // first child with label 'player'
parent.getChildByLabel('enemy', true);    // deep search through descendants
parent.getChildrenByLabel(/^item/);       // all children matching regex

// Reorder
parent.swapChildren(a, b);
parent.setChildIndex(c, 0);               // move c to front

// Remove
parent.removeChildAt(0);
parent.removeChildren();                   // remove all
```

**`reparentChild`** moves a child from its current parent while preserving its world transform (visual position stays the same). Useful for moving objects between coordinate spaces (e.g., picking up an item from the world into a UI layer).

```ts
uiLayer.reparentChild(sprite);           // append, preserve world transform
uiLayer.reparentChildAt(sprite, 0);      // insert at index 0
```

**`replaceChild`** swaps an existing child with a new one, copying the old child's local transform (position, rotation, scale) to the replacement. Useful for "replace in place" patterns like swapping a placeholder with a loaded asset.

```ts
parent.replaceChild(placeholder, loadedSprite);
```

### Render order

Children render in array order: index 0 draws first (behind), last index draws last (in front). Adding a child appends it to the end. For explicit control over draw order, see `zIndex`/`sortableChildren` in the scene-management skill and `RenderLayer` for decoupled render order.

### Transform properties

Every Container has position, scale, rotation/angle, pivot, origin, and skew. These compose into localTransform (a Matrix).

```ts
import { Container } from 'pixi.js';

const obj = new Container();

// Position
obj.x = 100;
obj.y = 200;
obj.position.set(100, 200); // equivalent

// Scale (uniform or per-axis)
obj.scale.set(2, 2);
obj.scale = 2; // shorthand for uniform scale

// Rotation in radians or degrees
obj.rotation = Math.PI / 4; // 45 degrees in radians
obj.angle = 45;             // 45 degrees directly

// Pivot: sets center of rotation/scale AND offsets position
obj.pivot.set(50, 50);

// Origin: sets center of rotation/scale WITHOUT moving position
obj.origin.set(50, 50);

// Skew (radians)
obj.skew.set(0.1, 0.2);
```

**Tension: pivot vs origin.** Pivot changes where the object rotates AND shifts its rendered position (the object's pivot point maps to its position in parent space). Origin only changes the rotation/scale center. Use origin when you want to rotate around a point without displacement. Do not set both pivot and origin on the same container; PixiJS warns that this leads to unexpected behavior.

**localTransform vs worldTransform.** `localTransform` is the Matrix composed from this container's own position/scale/rotation/pivot/skew relative to its parent. `worldTransform` is the composed Matrix relative to the scene root (all ancestor transforms multiplied together). Use `worldTransform` when you need screen-space coordinates. See the math skill for Matrix operations and `toGlobal`/`toLocal` coordinate conversion.

### Sizing

Setting `width` and `height` individually triggers bounds recalculation each time. When setting both dimensions, prefer `setSize`/`getSize`:

```ts
import { Container, Sprite } from 'pixi.js';

const sprite = new Sprite(texture);

// Preferred: single bounds calculation
sprite.setSize(200, 100);
const { width, height } = sprite.getSize();

// Also works, but two separate bounds calculations
sprite.width = 200;
sprite.height = 100;
```

Under the hood, `width`/`height` adjust `scale` to fit the target pixel size relative to the container's local bounds. `setSize` does the same but in one operation.

### Visibility, renderable, alpha, tint

```ts
import { Container } from 'pixi.js';

const obj = new Container();

// visible=false: skips rendering AND transform updates for entire subtree
obj.visible = false;

// renderable=false: skips rendering but still updates transforms
obj.renderable = false;

// Alpha is relative to parent (multiplicative up the tree)
obj.alpha = 0.5; // 50% of parent's effective alpha

// Tint multiplies vertex color (white = no tint)
obj.tint = 0xff0000; // red tint
obj.tint = 'red';    // CSS color name works too

// Blend mode
obj.blendMode = 'add';
```

### cacheAsTexture

Snapshot a container and all its children into a single texture. Subsequent frames render that one texture instead of processing every child. Best for containers with many static children (e.g., a decorated UI panel, complex background).

```ts
import { Container, Sprite } from 'pixi.js';

const panel = new Container();
// ... add many static children ...

// Enable: renders subtree to texture
panel.cacheAsTexture(true);

// After modifying children, refresh the cached texture
panel.updateCacheTexture();

// Disable caching
panel.cacheAsTexture(false);
```

Options for resolution and antialias:

```ts
panel.cacheAsTexture({ resolution: 2, antialias: true });
```

**Important:** always disable before destroying: `panel.cacheAsTexture(false)` then `panel.destroy()`. See the performance skill for details and tradeoffs.

### Destroy and cleanup

```ts
import { Sprite } from 'pixi.js';

const sprite = new Sprite(texture);

// Basic destroy: removes from parent, cleans up references
sprite.destroy();

// With options: also destroy children and texture
sprite.destroy({
    children: true,
    texture: true,
    textureSource: true,
});

// Check after destroy
console.log(sprite.destroyed); // true
```

## Common Mistakes

### CRITICAL: Adding children to leaf nodes

Wrong:
```ts
const sprite = new Sprite(texture);
const child = new Sprite(otherTexture);
sprite.addChild(child);
```

Correct:
```ts
const container = new Container();
const sprite = new Sprite(texture);
const child = new Sprite(otherTexture);
container.addChild(sprite, child);
```

In v8, only Container can have children. Sprite, Graphics, Mesh, and Text are leaf nodes with `allowChildren=false`. Attempting to add children to them logs a deprecation warning and will be an error in future versions.

Source: pixijs/pixijs:src/__docs__/migrations/v8.md

### HIGH: Using getBounds() and expecting a Rectangle type

`getBounds()` returns a `Bounds` object in v8, not a `Rectangle`. `Bounds` has `.x`, `.y`, `.width`, `.height` getters, so basic property access works. However, if you need a `Rectangle` instance (e.g., for APIs that require one, or for `.contains()`), use `.rectangle`:

```ts
const bounds = container.getBounds();
console.log(bounds.width); // works: Bounds has a width getter

const rect = container.getBounds().rectangle;
rect.contains(50, 50); // Rectangle methods available here
```

Source: pixijs/pixijs:src/__docs__/migrations/v8.md

### HIGH: Using cacheAsBitmap instead of cacheAsTexture

Wrong:
```ts
container.cacheAsBitmap = true;
```

Correct:
```ts
container.cacheAsTexture(true);
```

`cacheAsBitmap` was renamed to `cacheAsTexture()` (a method, not a property) in v8.

Source: pixijs/pixijs:src/__docs__/migrations/v8.md

### MEDIUM: Using container.name instead of container.label

Wrong:
```ts
container.name = 'player';
```

Correct:
```ts
container.label = 'player';
```

`name` was renamed to `label` in v8. The old property may still work as a deprecated alias.

Source: pixijs/pixijs:src/__docs__/migrations/v8.md

### MEDIUM: Confusing pivot and origin

Wrong (unexpected position shift):
```ts
const sprite = new Sprite(texture);
sprite.pivot.set(50, 50); // shifts rendered position by -50,-50
sprite.rotation = Math.PI / 4;
```

Correct (rotation center without displacement):
```ts
const sprite = new Sprite(texture);
sprite.origin.set(50, 50); // rotation center only, no position shift
sprite.rotation = Math.PI / 4;
```

Pivot sets the point in local space that maps to `position` in parent space. This means setting pivot moves where the object appears. Origin changes the rotation/scale center without affecting rendered position.

Source: pixijs/pixijs:src/scene/container/Container.ts

### HIGH: Anchor vs pivot confusion (cross-skill: sprite)

When working with Sprites, note that anchor is texture-relative (0-1 range) and pivot is in pixel space. Setting `anchor.set(0.5)` centers the texture at the sprite's position. Setting `pivot.set(width/2, height/2)` centers rotation but shifts position. Use anchor for Sprites, origin for Containers.

See also: sprite (anchor details), scene-management (render groups and layers), math (Matrix and coordinate transforms)

## Learn More

- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [ContainerOptions](https://pixijs.download/release/docs/scene.ContainerOptions.html.md)
