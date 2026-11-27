/**
 * `sprite churn`: a steady population of 10 000 sprites, of which the oldest K are removed and destroyed every frame
 * and K new ones created and added, as a spawner and a pool-less game would. The creation and the `destroy()` calls
 * are in the update, since they are the engine's.
 *
 * Judged on `cpu.frame`: construction, `addChild`, `removeChildren`, `destroy()` and the render's handling of a
 * child list that changes every frame, which is what object churn costs.
 *
 * Each sprite's look is a function of its slot in the population alone, and the slots are replaced in a fixed order
 * that repeats every 10 000 / K frames, a whole number of times per pass, so every pass draws the same frames.
 */

import { frame } from 'benchy';
import { Container, Sprite } from 'pixi.js';

import { makeSheet, PALETTE } from './shared.ts';
import type { PixiStage } from './shared.ts';

const POPULATION = 10_000;

frame('sprite churn', {
  variants: { c500: { churn: 500 }, c2000: { churn: 2000 } },
  primary: 'cpu.frame',
  duration: 4,
  create({ stage, width, height, rng }: PixiStage, { churn }) {
    const sheet = makeSheet(32);
    const pool = new Container({ label: 'pool' });
    stage.addChild(pool);

    // Every slot's sprite, the same each time the slot is reborn.
    const slotX = new Float32Array(POPULATION);
    const slotY = new Float32Array(POPULATION);
    const slotRotation = new Float32Array(POPULATION);
    const slotScale = new Float32Array(POPULATION);
    const slotTint = new Uint32Array(POPULATION);
    const slotTexture = new Uint8Array(POPULATION);
    for (let s = 0; s < POPULATION; s++) {
      slotX[s] = rng.range(0, width);
      slotY[s] = rng.range(0, height);
      slotRotation[s] = rng.range(0, Math.PI * 2);
      slotScale[s] = rng.range(0.4, 0.9);
      slotTint[s] = PALETTE[rng.int(16)] ?? 0xffffff;
      slotTexture[s] = rng.int(4);
    }

    function spawn(slot: number): Sprite {
      const sprite = new Sprite(sheet.textures[slotTexture[slot]]);
      sprite.anchor.set(0.5);
      sprite.position.set(slotX[slot], slotY[slot]);
      sprite.rotation = slotRotation[slot];
      sprite.scale.set(slotScale[slot]);
      sprite.tint = slotTint[slot];
      return sprite;
    }

    // Born in slot order, so the oldest `churn` children are always the next slots due.
    for (let s = 0; s < POPULATION; s++) pool.addChild(spawn(s));

    let first = 0;

    return {
      simulate(seconds) {
        first = (Math.round(seconds * 60) * churn) % POPULATION;
      },
      update() {
        const removed = pool.removeChildren(0, churn);
        for (let k = 0; k < churn; k++) removed[k].destroy();
        for (let k = 0; k < churn; k++) pool.addChild(spawn(first + k));
      },
      destroy() {
        pool.destroy({ children: true });
        sheet.destroy();
      },
    };
  },
});
