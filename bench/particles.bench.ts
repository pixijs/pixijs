/**
 * `particle container`: N `Particle`s in one `ParticleContainer`, drawn from one four-shape sheet, with only position
 * and rotation dynamic. Scale, tint, alpha and the texture frame are static, uploaded once; position and rotation are
 * written for every particle every frame and re-uploaded by the container's pipe.
 *
 * Judged on `cpu.frame`: the update is the field writes on N plain objects, and the render is the container packing
 * its dynamic attributes for N particles into its buffer and uploading it, which is the path a ParticleContainer
 * exists to make cheap.
 */

import { frame } from 'benchy';
import { Particle, ParticleContainer } from 'pixi.js';

import { makeSheet, PALETTE, wrap } from './shared.ts';
import type { PixiStage } from './shared.ts';

frame('particle container', {
  variants: { p100k: { count: 100_000 }, p500k: { count: 500_000 } },
  primary: 'cpu.frame',
  create({ stage, width, height, rng }: PixiStage, { count }) {
    const sheet = makeSheet(32);

    const x0 = new Float32Array(count);
    const y0 = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const r0 = new Float32Array(count);
    const spin = new Float32Array(count);
    const particles: Particle[] = new Array(count);
    for (let i = 0; i < count; i++) {
      x0[i] = rng.range(0, width);
      y0[i] = rng.range(0, height);
      const angle = rng.range(0, Math.PI * 2);
      const speed = rng.range(15, 120);
      vx[i] = Math.cos(angle) * speed;
      vy[i] = Math.sin(angle) * speed;
      r0[i] = rng.range(0, Math.PI * 2);
      spin[i] = rng.range(-4, 4);
      const size = rng.range(0.2, 0.45);
      particles[i] = new Particle({
        texture: sheet.textures[rng.int(4)],
        x: x0[i],
        y: y0[i],
        rotation: r0[i],
        scaleX: size,
        scaleY: size,
        anchorX: 0.5,
        anchorY: 0.5,
        tint: PALETTE[rng.int(16)],
        alpha: rng.range(0.5, 1),
      });
    }

    // The particles go in through the constructor: `addParticle(...particles)` spreads them onto the stack.
    const container = new ParticleContainer({
      texture: sheet.textures[0],
      particles,
      dynamicProperties: { vertex: false, position: true, rotation: true, uvs: false, color: false },
    });
    // A ParticleContainer given `particles` in its constructor never marks its static attributes dirty, so without
    // this the static buffer is never uploaded: WebGL2 refuses the draw ("vertex buffer is not big enough") and
    // WebGPU reads zeros for scale, tint and uvs.
    container.update();
    stage.addChild(container);

    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const rotation = new Float32Array(count);
    const margin = 16;

    return {
      simulate(seconds) {
        for (let i = 0; i < count; i++) {
          x[i] = wrap((x0[i] ?? 0) + (vx[i] ?? 0) * seconds, -margin, width + margin);
          y[i] = wrap((y0[i] ?? 0) + (vy[i] ?? 0) * seconds, -margin, height + margin);
          rotation[i] = (r0[i] ?? 0) + (spin[i] ?? 0) * seconds;
        }
      },
      update() {
        for (let i = 0; i < count; i++) {
          const particle = particles[i];
          particle.x = x[i];
          particle.y = y[i];
          particle.rotation = rotation[i];
        }
      },
      destroy() {
        container.destroy();
        sheet.destroy();
      },
    };
  },
});
