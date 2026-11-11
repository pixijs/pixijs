/**
 * `graphics redraw`: N `Graphics` cleared and redrawn every frame (a rectangle, a circle and a stroked four-point
 * polygon, each with sizes and colours that change from frame to frame) over a backdrop of 3000 `Graphics` drawn
 * once in `create` and never touched again.
 *
 * Judged on `cpu.frame`: the update records N contexts' commands, and the render rebuilds those N contexts'
 * geometry (triangulating the shapes and the strokes) and batches them with the 3000 static ones, whose geometry is
 * reused. That is what an app drawing dynamic vector shapes pays per frame.
 */

import { frame } from 'benchy';
import { Container, Graphics } from 'pixi.js';
import type { StrokeStyle } from 'pixi.js';

import { PALETTE } from './shared.ts';
import type { PixiStage } from './shared.ts';

const STATIC = 3000;

frame('graphics redraw', {
  variants: { g400: { count: 400 }, g2000: { count: 2000 } },
  primary: 'cpu.frame',
  create({ stage, width, height, rng }: PixiStage, { count }) {
    const root = new Container({ label: 'graphics' });
    stage.addChild(root);

    // The backdrop: drawn once, its geometry built on the first frame and reused after.
    const backdrop = new Container({ label: 'static' });
    root.addChild(backdrop);
    for (let i = 0; i < STATIC; i++) {
      const g = new Graphics();
      const size = rng.range(6, 28);
      const color = PALETTE[rng.int(16)] ?? 0xffffff;
      switch (rng.int(4)) {
        case 0:
          g.rect(-size, -size * 0.6, size * 2, size * 1.2).fill({ color, alpha: 0.5 });
          break;
        case 1:
          g.circle(0, 0, size).fill({ color, alpha: 0.4 }).stroke({ width: 1.5, color: 0x000000, alpha: 0.4 });
          break;
        case 2:
          g.roundRect(-size, -size, size * 2, size * 2, size * 0.3).stroke({ width: 2, color, alpha: 0.6 });
          break;
        default:
          g.poly([0, -size, size, size, -size, size]).fill({ color, alpha: 0.5 });
          break;
      }
      g.position.set(rng.range(0, width), rng.range(0, height));
      g.rotation = rng.range(0, Math.PI * 2);
      backdrop.addChild(g);
    }

    // The redrawn ones, on a grid over the whole canvas.
    const columns = Math.ceil(Math.sqrt((count * width) / height));
    const rows = Math.ceil(count / columns);
    const cellW = width / columns;
    const cellH = height / rows;
    const cell = Math.min(cellW, cellH);
    const dynamic: Graphics[] = new Array(count);
    const phase = new Float32Array(count);
    const shade = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      g.position.set((i % columns) * cellW + cellW / 2, Math.floor(i / columns) * cellH + cellH / 2);
      dynamic[i] = g;
      phase[i] = rng.range(0, Math.PI * 2);
      shade[i] = rng.int(16);
      root.addChild(g);
    }

    // What each frame's redraw is handed, written by `simulate`: the shapes' sizes and colours, the polygon's points
    // and the stroke's style, each in an array or object of its own that the redraw reads in place.
    const rectX = new Float32Array(count);
    const rectY = new Float32Array(count);
    const rectW = new Float32Array(count);
    const rectH = new Float32Array(count);
    const rectColor = new Uint32Array(count);
    const radius = new Float32Array(count);
    const circleColor = new Uint32Array(count);
    const points: number[][] = Array.from({ length: count }, () => [0, 0, 0, 0, 0, 0, 0, 0]);
    const strokes: StrokeStyle[] = Array.from({ length: count }, () => ({ width: 1, color: 0xffffff }));

    return {
      simulate(seconds) {
        const step = Math.round(seconds * 60);
        for (let i = 0; i < count; i++) {
          const p = phase[i] ?? 0;
          const a = 0.5 + 0.5 * Math.sin(seconds * 2 + p);
          const b = 0.5 + 0.5 * Math.cos(seconds * 1.6 + p * 1.3);
          const half = cell * 0.45;
          rectW[i] = half * (0.6 + 0.8 * a);
          rectH[i] = half * (0.4 + 0.6 * b);
          rectX[i] = -rectW[i] / 2;
          rectY[i] = -rectH[i] / 2;
          rectColor[i] = PALETTE[((shade[i] ?? 0) + (step >> 3)) & 15] ?? 0xffffff;
          radius[i] = half * (0.2 + 0.3 * b);
          circleColor[i] = PALETTE[((shade[i] ?? 0) + 7) & 15] ?? 0xffffff;
          const poly = points[i];
          const spin = seconds * 1.5 + p;
          for (let k = 0; k < 4; k++) {
            const angle = spin + (k * Math.PI) / 2;
            const reach = half * (k % 2 === 0 ? 0.9 : 0.5 + 0.4 * a);
            poly[k * 2] = Math.cos(angle) * reach;
            poly[k * 2 + 1] = Math.sin(angle) * reach;
          }
          const stroke = strokes[i];
          stroke.width = 1 + 3 * a;
          stroke.color = PALETTE[((shade[i] ?? 0) + 3 + (step >> 4)) & 15] ?? 0xffffff;
        }
      },
      update() {
        for (let i = 0; i < count; i++) {
          dynamic[i]
            .clear()
            .rect(rectX[i], rectY[i], rectW[i], rectH[i])
            .fill(rectColor[i])
            .circle(0, 0, radius[i])
            .fill(circleColor[i])
            .poly(points[i])
            .stroke(strokes[i]);
        }
      },
      destroy() {
        root.destroy({ children: true, context: true });
      },
    };
  },
});
