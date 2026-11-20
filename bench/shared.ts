/**
 * What the pixi 2D benches share: the stage a bench is handed, typed, a numeric tint palette, and textures drawn
 * in-page on a canvas so no bench loads anything over the network.
 */

import type { FrameStage } from 'benchy';
import { CanvasSource, DOMAdapter, Rectangle, Texture } from 'pixi.js';
import type { Container, ICanvas, ICanvasRenderingContext2D, Renderer } from 'pixi.js';

/**
 * The pixi stage: a renderer on exactly the backend asked for, at the canvas's device pixels and resolution 1, and the
 * root container (a render group) the bench adds its scene to.
 */
export type PixiStage = FrameStage<{ renderer: Renderer; stage: Container }>;

/** Sixteen tints, indexed with `& 15`. */
export const PALETTE: readonly number[] = [
  0xffffff, 0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xc77dff, 0xff9f1c, 0x2ec4b6,
  0xe71d36, 0xfdfffc, 0x9bf6ff, 0xffc6ff, 0xcaffbf, 0xfdffb6, 0xa0c4ff, 0xbdb2ff,
];

/** A set of textures the bench made and has to release. */
export interface GeneratedTextures {
  readonly textures: Texture[];
  destroy(): void;
}

/** The four shapes a cell can hold: a disc, a ring, a diamond and a square with a hole. */
function drawShape(
  ctx: ICanvasRenderingContext2D,
  kind: number,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  const c = size / 2;
  const r = size * 0.42;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.beginPath();
  switch (kind & 3) {
    case 0:
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 1:
      ctx.arc(c, c, r * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 2:
      ctx.moveTo(c, c - r);
      ctx.lineTo(c + r, c);
      ctx.lineTo(c, c + r);
      ctx.lineTo(c - r, c);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      ctx.rect(c - r, c - r, r * 2, r * 2);
      ctx.rect(c + r * 0.4, c - r * 0.4, -r * 0.8, r * 0.8);
      ctx.fill('evenodd');
      break;
  }
  ctx.restore();
}

function canvas(width: number, height: number): { element: ICanvas; ctx: ICanvasRenderingContext2D } {
  const element = DOMAdapter.get().createCanvas(width, height);
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('no 2d canvas context to draw the bench textures with');
  return { element, ctx };
}

/** Light shape colours, so a tint still reads. */
const SHEET_COLORS = ['#ffffff', '#ffe6a8', '#bfe8ff', '#ffc4dc'];

/**
 * Four distinct shapes in one canvas, one `Texture` frame each over a single source, so everything drawn from the
 * sheet can share one batch. Each shape sits inside its cell with a transparent margin, so linear filtering never
 * reads a neighbour.
 */
export function makeSheet(cell = 64): GeneratedTextures {
  const { element, ctx } = canvas(cell * 4, cell);
  for (let i = 0; i < 4; i++) drawShape(ctx, i, i * cell, 0, cell, SHEET_COLORS[i] ?? '#ffffff');
  const source = new CanvasSource({ resource: element, label: 'bench-sheet' });
  const textures = [0, 1, 2, 3].map(
    (i) => new Texture({ source, frame: new Rectangle(i * cell, 0, cell, cell), label: `bench-sheet-${i}` }),
  );
  return {
    textures,
    destroy() {
      for (const texture of textures) texture.destroy(false);
      source.destroy();
    },
  };
}

/**
 * `count` textures, each on a source of its own, so every one is a separate texture binding and more of them than a
 * batch has texture units forces the batcher to break.
 */
export function makeTextureSet(count: number, size = 48): GeneratedTextures {
  const sources: CanvasSource[] = [];
  const textures: Texture[] = [];
  for (let i = 0; i < count; i++) {
    const { element, ctx } = canvas(size, size);
    drawShape(ctx, i, 0, 0, size, `hsl(${Math.round((i * 360) / count)}, 70%, 75%)`);
    const source = new CanvasSource({ resource: element, label: `bench-set-${i}` });
    sources.push(source);
    textures.push(new Texture({ source, label: `bench-set-${i}` }));
  }
  return {
    textures,
    destroy() {
      for (const texture of textures) texture.destroy(false);
      for (const source of sources) source.destroy();
    },
  };
}

/** `value` wrapped into [min, max). */
export function wrap(value: number, min: number, max: number): number {
  const span = max - min;
  return ((((value - min) % span) + span) % span) + min;
}
