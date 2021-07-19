import { ParticleContainer } from '@pixi/particle-container';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { expect } from 'chai';

describe('ParticleContainer', function ()
{
    it('should construct a container', function ()
    {
        const container = new ParticleContainer();

        expect(container).to.be.an.instanceOf(ParticleContainer);
        expect(container.children).to.have.length(0);

        container.destroy();
    });

    it('should add a child', function ()
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
