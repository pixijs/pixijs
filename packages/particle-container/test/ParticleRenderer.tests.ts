import path from 'path';
import { Renderer, Texture } from '@pixi/core';
import { ParticleContainer } from '@pixi/particle-container';
import { Sprite } from '@pixi/sprite';

describe('ParticleRenderer', () =>
{
    it('should render a particle container with no children', () =>
    {
        const renderer = new Renderer();
        const container = new ParticleContainer();

        expect(container.children.length).toEqual(0);

        renderer.render(container);
        container.destroy();
        renderer.destroy();
    });

    it('should render a particle container with children', () =>
    {
        const renderer = new Renderer();
        const container = new ParticleContainer();
        const child = new Sprite(Texture.WHITE);

        container.addChild(child);
        renderer.render(container);
        container.destroy(true);
        renderer.destroy();
    });

    it('should render a particle container with lazy texture loading', (done: () => void) =>
    {
        const image = new Image();

        image.src = path.join(__dirname, 'resources/bunny.png');

        const child = Sprite.from(image);

        expect(child.texture.baseTexture.valid).toBe(false);

        const container = new ParticleContainer();
        const renderer = new Renderer();

        container.addChild(child);
        renderer.render(container);

        child.texture.baseTexture.once('update', () =>
        {
            container.destroy(true);
            renderer.destroy();
            done();
        });
    });

    it('should support autoResize off', () =>
    {
        const renderer = new Renderer();
        const container = new ParticleContainer(1);
        const child = new Sprite(Texture.WHITE);
        const child2 = new Sprite(Texture.WHITE);

        container.autoResize = false;
        container.addChild(child, child2);
        renderer.render(container);
        container.destroy(true);
        renderer.destroy();
    });

    it('should support autoResize on', () =>
    {
        const renderer = new Renderer();
        const container = new ParticleContainer(1);
        const child = new Sprite(Texture.WHITE);
        const child2 = new Sprite(Texture.WHITE);

        container.autoResize = true;
        container.addChild(child, child2);
        renderer.render(container);
        container.destroy(true);
        renderer.destroy();
    });
});
