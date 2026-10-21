/**
 * Construction costs that need no renderer, timed in Node: making sprites, building a container tree, and recording
 * graphics contexts and triangulating them into the geometry a renderer would upload.
 *
 * Text measurement is not here: `CanvasTextMetrics` measures through a 2D canvas, which Node does not have.
 *
 * This file imports only `pixi.js`, never `./shared.ts`, whose textures are drawn on a DOM canvas.
 */

import { cpu } from 'benchy';
import { buildContextBatches, Container, GpuGraphicsContext, GraphicsContext, Sprite, Texture } from 'pixi.js';

/** A seeded stream for the layouts, since a cpu bench has no stage `rng`. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

cpu('construct 10k sprites', () => {
  const texture = Texture.EMPTY;
  let checksum = 0;
  for (let i = 0; i < 10_000; i++) {
    const sprite = new Sprite(texture);
    sprite.x = i;
    checksum += sprite.x + sprite.width;
  }
  return checksum;
});

cpu('construct 10k containers with children', () => {
  // 100 parents of 99 children each, under one root: 10 000 containers, every one added with `addChild`.
  const root = new Container();
  for (let p = 0; p < 100; p++) {
    const parent = new Container();
    for (let c = 0; c < 99; c++) parent.addChild(new Container());
    root.addChild(parent);
  }
  let checksum = root.children.length;
  for (const parent of root.children) checksum += parent.children.length;
  return checksum;
});

cpu('graphics build 1k', function* () {
  // Each context's shapes, laid out once: a rectangle, a circle, a rounded rectangle and a stroked polygon.
  const random = mulberry32(0x6a09e667);
  const shapes = Array.from({ length: 1000 }, () => ({
    x: random() * 1000,
    y: random() * 1000,
    w: 10 + random() * 90,
    h: 10 + random() * 90,
    r: 5 + random() * 40,
    color: Math.floor(random() * 0xffffff),
    points: Array.from({ length: 10 }, () => random() * 100),
    stroke: 1 + random() * 6,
  }));
  const geometry = new GpuGraphicsContext();
  let total = 0;
  yield {
    // Recording the commands and building the geometry a renderer would upload: `buildContextBatches` is what
    // `GraphicsContextSystem` runs on a context it has not seen, with no renderer needed.
    bench: () => {
      let checksum = 0;
      for (const shape of shapes) {
        const context = new GraphicsContext()
          .rect(shape.x, shape.y, shape.w, shape.h)
          .fill(shape.color)
          .circle(shape.x, shape.y, shape.r)
          .fill({ color: shape.color, alpha: 0.5 })
          .roundRect(shape.x, shape.y, shape.w, shape.h, 6)
          .stroke({ width: shape.stroke, color: 0x000000 })
          .poly(shape.points)
          .stroke({ width: shape.stroke, color: shape.color });
        buildContextBatches(context, geometry);
        checksum += geometry.geometryData.vertices.length + geometry.geometryData.indices.length;
        // Returns the batches to the pool, as the system does before a rebuild.
        geometry.reset();
        context.destroy();
      }
      total = checksum;
      return checksum;
    },
    snapshot: () => total,
  };
});
