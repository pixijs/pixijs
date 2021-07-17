import { ParticleContainer, ParticleRenderer } from '@pixi/particle-container';
import { Texture, Renderer } from '@pixi/core';
import { skipHello } from '@pixi/utils';
import { Sprite } from '@pixi/sprite';
import { expect } from 'chai';
import path from 'path';

skipHello();

describe('ParticleRenderer', function ()
{
    beforeEach(function ()
    {
        Renderer.registerPlugin('particle', ParticleRenderer);
    });

    afterEach(function ()
    {
        delete Renderer.__plugins.particle;
    });

    it('should render a particle container with no children', function ()
    {
        const renderer = new Renderer();
        const container = new ParticleContainer();

        expect(container.children.length).to.equal(0);

        renderer.render(container);
        container.destroy();
        renderer.destroy();
    });

    it('should render a particle container with children', function ()
    {
        const renderer = new Renderer();
        const container = new ParticleContainer();
        const child = new Sprite(Texture.WHITE);

        container.addChild(child);
        renderer.render(container);
        container.destroy(true);
        renderer.destroy();
    });

    it('should render a particle container with lazy texture loading', function (done: () => void)
    {
        const image = new Image();

        image.src = path.join(__dirname, 'resources/bunny.png');

        const child = Sprite.from(image);

        expect(child.texture.baseTexture.valid).to.be.false;

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

    it('should support autoResize off', function ()
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

    it('should support autoResize on', function ()
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
