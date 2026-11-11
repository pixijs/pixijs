# render-groups

What `isRenderGroup` saves, when to use it, and how it differs from `cacheAsTexture`.

A render group is a `Container` whose subtree has its own instruction set, with child transforms stored relative to the group. The group's own transform, alpha and tint are applied as one matrix/color, so moving, scaling or fading the group root does not recompute any descendant.

```ts
const world = new Container({ isRenderGroup: true }); // thousands of entities
const hud = new Container({ isRenderGroup: true });
app.stage.addChild(world, hud);

world.x = 100; // updates one group matrix; the children are not recomputed
```

Flag a container with `isRenderGroup: true` at construction, or call `enableRenderGroup()` at runtime. The root container passed to `renderer.render()` (`app.stage`) is a render group already.

## What it saves

v8 recomputes transforms only for containers that changed and their descendants, with or without render groups; an unchanged subtree costs nothing per frame, so a static subtree gains nothing from a group. The win is a large subtree whose root moves as a whole: without a group, moving a container recomputes every descendant; with one, only the group matrix changes (see [transforms](transforms.md#the-three-matrices)).

Good fits: a game world with thousands of entities that scrolls or zooms, a HUD or menu that slides, scales or fades as a unit, parallax strips.

Bad fits:

- Small subtrees (a dozen children): the overhead outweighs the save.
- Structure that changes every frame (children added or removed): each structural change rebuilds the group's instruction list. Children animating their own transforms is fine.
- One group per entity, or groups nested several levels deep: each group draws separately and cannot batch with objects outside it. Use one group per subsystem (world, HUD) and keep the children plain containers.

Most scenes need no explicit groups beyond the root; add one when moving a large subtree shows up in CPU profiles.

## Render groups vs cacheAsTexture

- `cacheAsTexture()` rasterizes the subtree once and draws that texture; for subtrees that are visually static ([performance](../performance.md#cacheastexture-for-performance)).
- `isRenderGroup` keeps normal drawing, so children stay sharp and can animate; for subtrees whose structure is stable but whose root moves.
