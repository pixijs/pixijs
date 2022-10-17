import { ParticleContainer } from '@pixi/particle-container';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';

describe('ParticleContainer', () =>
{
    it('should construct a container', () =>
    {
        const container = new ParticleContainer();

        expect(container).toBeInstanceOf(ParticleContainer);
        expect(container.children).toHaveLength(0);

        container.destroy();
    });

    it('should add a child', () =>
    {
        const container = new ParticleContainer();
        const child = new Sprite(Texture.WHITE);

        container.addChild(child);

        container.destroy();
    });

    it('should support setting all properties', () =>
    {
        const container = new ParticleContainer(undefined, {
            scale: true,
            alpha: true,
            tint: true,
            uvs: true,
            vertices: true,
            position: true,
            rotation: true,
        });

        container.destroy();
    });
});
