import { Particle } from '../Particle';
import { particleData } from '../particleData';
import { generateParticleUpdateFunction } from '../utils/generateParticleUpdateFunction';
import { Texture } from '~/rendering';

import type { ParticleRendererProperty } from '../particleData';

describe('generateParticleUpdateFunction', () =>
{
    function withDynamic(dynamic: boolean): Record<string, ParticleRendererProperty>
    {
        const properties: Record<string, ParticleRendererProperty> = {};

        for (const key in particleData)
        {
            properties[key] = { ...particleData[key], dynamic };
        }

        return properties;
    }

    function upload(properties: Record<string, ParticleRendererProperty>)
    {
        const { staticUpdate, dynamicUpdate } = generateParticleUpdateFunction(properties);
        const particles = [new Particle(Texture.WHITE), new Particle({ texture: Texture.WHITE, x: 10, y: 20 })];
        const f32v = new Float32Array(particles.length * 4 * 9);
        const u32v = new Uint32Array(f32v.buffer);

        staticUpdate(particles, f32v, u32v);
        dynamicUpdate(particles, f32v, u32v);
    }

    it.each([
        ['default', particleData],
        ['all static', withDynamic(false)],
        ['all dynamic', withDynamic(true)],
    ])('should not create globals when uploading (%s properties)', (_name, properties) =>
    {
        const before = Object.keys(globalThis);

        upload(properties);

        expect(Object.keys(globalThis)).toEqual(before);
    });

    it('should write the quad vertices from the texture size and anchor', () =>
    {
        const { staticUpdate } = generateParticleUpdateFunction({ vertex: particleData.vertex });
        const particle = new Particle({ texture: Texture.WHITE, anchorX: 0.5, anchorY: 0.5, scaleX: 2 });
        const f32v = new Float32Array(8);

        staticUpdate([particle], f32v, new Uint32Array(f32v.buffer));

        const { width, height } = Texture.WHITE.orig;

        expect(Array.from(f32v)).toEqual([
            -width, -height / 2,
            width, -height / 2,
            width, height / 2,
            -width, height / 2,
        ]);
    });

    it('should run custom property code that assigns an undeclared name', () =>
    {
        // custom properties written for the old generated functions may rely on sloppy-mode implicit globals
        const { dynamicUpdate } = generateParticleUpdateFunction({
            custom: {
                attributeName: 'aCustom',
                format: 'float32',
                dynamic: true,
                code: `
                    customParticleScratch = p.x * 2;
                    f32v[offset] = customParticleScratch;
                `,
            },
        });
        const f32v = new Float32Array(4);

        try
        {
            dynamicUpdate([new Particle({ texture: Texture.WHITE, x: 3 })], f32v, new Uint32Array(f32v.buffer));

            expect(f32v[0]).toBe(6);
        }
        finally
        {
            delete (globalThis as Record<string, unknown>).customParticleScratch;
        }
    });
});
