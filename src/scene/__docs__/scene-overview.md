---
title: Overview
category: scene
---

# Scene

The scene graph in PixiJS is a hierarchical tree of display objects that defines what gets rendered, how, and in what order. Every visual element in your application is part of this scene graph.

## Display Objects

All display objects inherit from the `Container` class, which provides core functionality for:

- Transformations (position, rotation, scale)
- Parent-child relationships
- Rendering properties (alpha, visible, filters)
- Event handling
- Bounds calculation

### Available Display Objects

- **Containers**

    - {@link Container} - Base class for grouping objects
    - {@link ParticleContainer} - Optimized container for particle systems

- **Leaf Nodes**
    - {@link Sprite} - Basic image display
    - {@link AnimatedSprite} - Sprite animation support
    - {@link TilingSprite} - Repeating texture patterns
    - {@link NineSliceSprite} - Scalable UI elements
    - {@link Text} - Canvas-based text rendering
    - {@link HTMLText} - HTML/CSS-based text
    - {@link BitmapText} - High-performance bitmap fonts
    - {@link Graphics} - Vector shape drawing
    - {@link Mesh} - Custom vertex-based rendering
        - {@link MeshSimple} - Basic mesh with convenient constructor
        - {@link MeshPlane} - Deformable textured plane
        - {@link MeshRope} - Rope-like curved mesh

> [!NOTE]
> Leaf nodes are renderable objects that should not have children. In v8, **only containers should have children**.
>
> Attempting to add children to a leaf node will not result in a runtime error, however, you may run into unexpected rendering behavior. Therefore, If nesting is required, wrap leaf nodes in a `Container`.
>
> **Before v8 (invalid in v8):**
>
> ```ts
> const sprite = new Sprite();
> sprite.addChild(anotherSprite); // ❌ Invalid in v8
> ```
>
> **v8 approach:**
>
> ```ts
> const group = new Container();
> group.addChild(sprite);
> group.addChild(anotherSprite); // ✅ Valid
> ```

## Core Features

### Transformations

Every display object supports these transform properties:

```ts
const object = new Sprite(texture);

// Position
object.x = 100;
object.y = 100;
object.position.set(100, 100);

// Scale
object.scale.set(2, 2);

// Rotation (in radians)
object.rotation = Math.PI / 4; // 45 degrees
object.angle = 45; // Also 45 degrees

// Skew
object.skew.set(0.5, 0.3);

// Origin point for transforms
object.pivot.set(32, 32);
```

### Hierarchy Management

```ts
const parent = new Container();
const child = new Sprite(texture);

// Add/remove children
parent.addChild(child);
parent.removeChild(child);

// Bulk operations
parent.addChild(spriteA, spriteB, spriteC);
parent.removeChildren();

// Check relationships
console.log(child.parent === parent); // true
console.log(parent.children.length); // Number of children
```

### Visual Properties

```ts
const object = new Sprite(texture);

// Visibility
object.visible = false;

// Transparency
object.alpha = 0.5;

// Tinting
object.tint = 0xff0000; // Red tint
object.tint = '#ff0000'; // Also red

// Blend modes
object.blendMode = 'add';

// Masking
const mask = new Graphics().circle(0, 0, 50).fill(0xffffff);
object.mask = mask;

// Filters
object.filters = [new BlurFilter(2), new ColorMatrixFilter()];
```

### Bounds & Measurements

```ts
const sprite = new Sprite(texture);

// Get dimensions
const bounds = sprite.getBounds();
console.log(bounds.width, bounds.height);

// Local vs Global bounds
const localBounds = sprite.getLocalBounds();
const globalBounds = sprite.getBounds();

// Quick size access
sprite.width = 100;
sprite.height = 100;
```

### Interaction

```ts
const button = new Sprite(texture);
button.interactive = true;

// Event handling
button.on('pointerdown', (event) => {
    console.log('Clicked!', event);
});

button.on('pointhover', (event) => {
    button.alpha = 0.8;
});

// Hit testing
const hit = button.containsPoint({ x: 100, y: 100 });
```

### Rendering Callbacks

```ts
const spinner = new Container();

// Run every frame
spinner.onRender = () => {
    spinner.rotation += 0.1;
};

// Remove callback
spinner.onRender = null;
```

## Best Practices

- Use `cacheAsBitmap` for static complex content
- Be careful with filters and masks
- Remove unused objects with `removeChild()`
- Use `destroy()` to clean up resources
- Pool and reuse objects when possible

## Related Documentation

- See {@link Container} for base display object functionality
- See {@link Sprite} for image rendering
- See {@link AnimatedSprite} for sprite animations
- See {@link TilingSprite} for repeating textures
- See {@link NineSliceSprite} for scalable UI elements
- See {@link Graphics} for shape drawing
- See {@link Text} for text rendering
- See {@link BitmapText} for bitmap fonts
- See {@link HTMLText} for HTML/CSS text rendering
- See {@link Mesh} for custom rendering
- See {@link ParticleContainer} for performance optimization
- See {@link EventSystem} for event handling
