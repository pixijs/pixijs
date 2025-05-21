import { ParticleBuffer } from '../ParticleBuffer';
import { particleData } from '../particleData';
import { Particle } from '../Particle';
import { Texture } from '~/rendering';

function createProperties()
{
    const properties: Record<string, any> = {};

    for (const key in particleData)
    {
        properties[key] = { ...particleData[key], dynamic: key === 'position' };
    }

    return properties;
}

describe('ParticleBuffer', () =>
{
    it('should grow when particle count exceeds size', () =>
    {
        const properties = createProperties();
        const buffer = new ParticleBuffer({ size: 5, properties, minSize: 5 });
        const particles = Array.from({ length: 10 }, () => new Particle({ texture: Texture.WHITE }));

        buffer.update(particles, true);

        expect(buffer.indexBuffer.length / 6).toBeGreaterThanOrEqual(particles.length);
    });

    it('should shrink when particle count drops significantly', () =>
    {
        const properties = createProperties();
        const buffer = new ParticleBuffer({ size: 5, properties, minSize: 5 });
        const many = Array.from({ length: 20 }, () => new Particle({ texture: Texture.WHITE }));

        buffer.update(many, true);
        const sizeAfterGrow = buffer.indexBuffer.length / 6;

        const few = Array.from({ length: 2 }, () => new Particle({ texture: Texture.WHITE }));

        buffer.update(few, true);
        const sizeAfterShrink = buffer.indexBuffer.length / 6;

        expect(sizeAfterShrink).toBeLessThan(sizeAfterGrow);
        expect(sizeAfterShrink).toBeGreaterThanOrEqual(5);
    });
});
