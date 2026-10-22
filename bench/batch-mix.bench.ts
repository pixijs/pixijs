/**
 * `batch breakers`: N sprites over 32 textures on 32 separate sources (more than a batch has texture units), in runs
 * of 24 siblings per blend mode cycling through 8 modes, spread over 30 groups: 20 clipped by a `Graphics` mask, 4 under a `BlurFilter`, 6
 * plain. Every sprite is tinted, and everything drifts slowly: the sprites inside their groups and the groups
 * themselves.
 *
 * Judged on `cpu.render`: everything that splits a batch is here at once (texture-unit overflow, blend changes, mask
 * push and pop, filter passes), so the render's cost is the batcher deciding where to break and the encoder issuing
 * what it decided. Its GPU side (`gpu.frame`) is worth reading too, for the filter passes and the draw count.
 */

import { frame } from 'benchy';
import { BlurFilter, Container, Graphics, Sprite } from 'pixi.js';
import type { BLEND_MODES } from 'pixi.js';

import { makeTextureSet, PALETTE } from './shared.ts';
import type { PixiStage } from './shared.ts';

const TEXTURES = 32;
/** Blend modes every backend draws natively, without the advanced-blend filter. */
const BLEND_MODES_CYCLED: BLEND_MODES[] = ['normal', 'add', 'multiply', 'screen', 'normal-npm', 'add-npm', 'screen-npm', 'max'];
/** Sprites in one run of a blend mode before the next mode starts. */
const BLEND_RUN = 24;
const COLUMNS = 6;
const ROWS = 5;
const MASKED = 20;
const BLURRED = 4;

frame('batch breakers', {
  variants: { m6k: { count: 6000 }, m20k: { count: 20_000 } },
  primary: 'cpu.render',
  create({ stage, width, height, rng }: PixiStage, { count }) {
    const set = makeTextureSet(TEXTURES);
    const root = new Container({ label: 'batch mix' });
    stage.addChild(root);

    const groupCount = COLUMNS * ROWS;
    const cellW = width / COLUMNS;
    const cellH = height / ROWS;
    const groups: Container[] = [];
    const groupX: number[] = [];
    const groupY: number[] = [];
    const filters: BlurFilter[] = [];
    // Which groups are masked and which blurred, spread over the grid rather than in reading order.
    const order = Array.from({ length: groupCount }, (_, i) => i);
    for (let i = groupCount - 1; i > 0; i--) {
      const j = rng.int(i + 1);
      const swap = order[i];
      order[i] = order[j];
      order[j] = swap;
    }
    for (let g = 0; g < groupCount; g++) {
      const group = new Container({ label: `group ${g}` });
      group.position.set((g % COLUMNS) * cellW + cellW / 2, Math.floor(g / COLUMNS) * cellH + cellH / 2);
      groupX.push(group.x);
      groupY.push(group.y);
      const role = order.indexOf(g);
      if (role < MASKED) {
        const mask = new Graphics()
          .roundRect(-cellW * 0.45, -cellH * 0.45, cellW * 0.9, cellH * 0.9, 16)
          .fill(0xffffff);
        group.addChild(mask);
        group.mask = mask;
      } else if (role < MASKED + BLURRED) {
        const blur = new BlurFilter({ strength: 4, quality: 2 });
        filters.push(blur);
        group.filters = [blur];
      }
      groups.push(group);
      root.addChild(group);
    }

    // Each sprite's home in its group and the slow orbit it drifts on.
    const homeX = new Float32Array(count);
    const homeY = new Float32Array(count);
    const orbit = new Float32Array(count);
    const rate = new Float32Array(count);
    const phase = new Float32Array(count);
    const sprites: Sprite[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(set.textures[rng.int(TEXTURES)]);
      sprite.anchor.set(0.5);
      sprite.scale.set(rng.range(0.4, 0.9));
      sprite.tint = PALETTE[rng.int(16)];
      sprite.alpha = rng.range(0.6, 1);
      // Sprite i is the floor(i / groupCount)th sprite of its group, so runs of BLEND_RUN siblings share a mode.
      // (Taking the mode from i itself would give every sibling a different mode from the one before it: one draw
      // per sprite.)
      const indexInGroup = Math.floor(i / groupCount);

      sprite.blendMode = BLEND_MODES_CYCLED[Math.floor(indexInGroup / BLEND_RUN) % BLEND_MODES_CYCLED.length];
      homeX[i] = rng.range(-cellW * 0.45, cellW * 0.45);
      homeY[i] = rng.range(-cellH * 0.45, cellH * 0.45);
      orbit[i] = rng.range(4, 24);
      rate[i] = rng.range(0.2, 0.8) * (rng.next() < 0.5 ? -1 : 1);
      phase[i] = rng.range(0, Math.PI * 2);
      sprites[i] = sprite;
      groups[i % groupCount].addChild(sprite);
    }

    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const gx = new Float32Array(groupCount);
    const gy = new Float32Array(groupCount);

    return {
      simulate(seconds) {
        for (let i = 0; i < count; i++) {
          const angle = (rate[i] ?? 0) * seconds + (phase[i] ?? 0);
          x[i] = (homeX[i] ?? 0) + Math.cos(angle) * (orbit[i] ?? 0);
          y[i] = (homeY[i] ?? 0) + Math.sin(angle) * (orbit[i] ?? 0);
        }
        for (let g = 0; g < groupCount; g++) {
          gx[g] = (groupX[g] ?? 0) + Math.sin(seconds * 0.4 + g) * 6;
          gy[g] = (groupY[g] ?? 0) + Math.cos(seconds * 0.3 + g) * 4;
        }
      },
      update() {
        for (let i = 0; i < count; i++) sprites[i].position.set(x[i], y[i]);
        for (let g = 0; g < groupCount; g++) groups[g].position.set(gx[g], gy[g]);
      },
      destroy() {
        root.destroy({ children: true, context: true });
        for (const blur of filters) blur.destroy();
        set.destroy();
      },
    };
  },
});
