/**
 * `sprite field`: N sprites from one four-shape sheet (one texture source, so the batcher can draw them together),
 * every one of them changing every property every frame: position, rotation, scale, alpha and tint. This is the
 * 2dbench "particles" shape, built from `Sprite`s rather than a `ParticleContainer`. `mixed10k` gives one sprite in
 * eight a touched feature (zIndex, width, cullable, eventMode, label, local bounds, world transform).
 *
 * Judged on `cpu.frame`: the update is N times six setter calls, and the render is the transform walk, the batching
 * and the vertex upload of N quads that all moved, so both halves are what an app with a field like this pays.
 */

import { frame } from 'benchy';
import { Container, Sprite } from 'pixi.js';

import { makeSheet, PALETTE, wrap } from './shared.ts';
import type { PixiStage } from './shared.ts';

frame('sprite field', {
  variants: { s10k: { count: 10_000, mixed: false }, s50k: { count: 50_000, mixed: false }, mixed10k: { count: 10_000, mixed: true } },
  primary: 'cpu.frame',
  create({ stage, width, height, rng }: PixiStage, { count, mixed }) {
    const sheet = makeSheet();
    const field = new Container({ label: 'sprite field' });
    stage.addChild(field);

    // Each sprite's own motion: a start, a drift, a spin, and a phase for its pulse.
    const x0 = new Float32Array(count);
    const y0 = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const r0 = new Float32Array(count);
    const spin = new Float32Array(count);
    const phase = new Float32Array(count);
    const sprites: Sprite[] = new Array(count);
    for (let i = 0; i < count; i++) {
      x0[i] = rng.range(0, width);
      y0[i] = rng.range(0, height);
      const angle = rng.range(0, Math.PI * 2);
      const speed = rng.range(20, 160);
      vx[i] = Math.cos(angle) * speed;
      vy[i] = Math.sin(angle) * speed;
      r0[i] = rng.range(0, Math.PI * 2);
      spin[i] = rng.range(-3, 3);
      phase[i] = rng.range(0, Math.PI * 2);
      const sprite = new Sprite(sheet.textures[rng.int(4)]);
      sprite.anchor.set(0.5);
      sprites[i] = sprite;
      field.addChild(sprite);
      if (mixed) {
        // A subset of sprites has touched a feature, as a real scene's would: each touch is a field the
        // engine may only create on first use, so it decides how many hidden classes the field holds.
        switch (i & 7) {
          case 1: sprite.zIndex = 1; break;
          case 2: sprite.width = 24; break;
          case 3: sprite.cullable = true; break;
          case 4: sprite.eventMode = 'static'; break;
          case 5: sprite.label = 'tagged'; break;
          case 6: sprite.getLocalBounds(); break;
          case 7: void sprite.worldTransform; break;
          default: break;
        }
      }
    }

    // What the frame hands the engine, written by `simulate`.
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const rotation = new Float32Array(count);
    const scale = new Float32Array(count);
    const alpha = new Float32Array(count);
    const tint = new Uint32Array(count);
    const margin = 32;

    return {
      simulate(seconds) {
        const step = Math.round(seconds * 60);
        for (let i = 0; i < count; i++) {
          const p = phase[i] ?? 0;
          x[i] = wrap((x0[i] ?? 0) + (vx[i] ?? 0) * seconds, -margin, width + margin);
          y[i] = wrap((y0[i] ?? 0) + (vy[i] ?? 0) * seconds, -margin, height + margin);
          rotation[i] = (r0[i] ?? 0) + (spin[i] ?? 0) * seconds;
          scale[i] = 0.35 + 0.15 * Math.sin(seconds * 3 + p);
          alpha[i] = 0.65 + 0.35 * Math.sin(seconds * 2 + p * 1.7);
          tint[i] = PALETTE[(i + step) & 15] ?? 0xffffff;
        }
      },
      update() {
        for (let i = 0; i < count; i++) {
          const sprite = sprites[i];
          sprite.x = x[i];
          sprite.y = y[i];
          sprite.rotation = rotation[i];
          sprite.scale.set(scale[i]);
          sprite.alpha = alpha[i];
          sprite.tint = tint[i];
        }
      },
      destroy() {
        field.destroy({ children: true });
        sheet.destroy();
      },
    };
  },
});
