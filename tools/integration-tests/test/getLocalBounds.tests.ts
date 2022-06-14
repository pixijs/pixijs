import { Container } from '@pixi/display';
import { RenderTexture } from '@pixi/core';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Sprite } from '@pixi/sprite';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import { Graphics } from '@pixi/graphics';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { Text } from '@pixi/text';
import { SimplePlane } from '@pixi/mesh-extras';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { expect } from 'chai';

import '@pixi/canvas-display';
import '@pixi/canvas-text';

CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);

function withGL(fn: () => void)
{
    return !process.env.DISABLE_WEBGL ? fn : undefined;
}

describe('getLocalBounds', () =>
{
    it('should register correct local-bounds with a LOADED Sprite', () =>
    {
        const parent = new Container();
        const texture = RenderTexture.create({ width: 10, height: 10 });

        const sprite = new Sprite(texture);

        parent.addChild(sprite);

        let bounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        bounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it('should register correct local-bounds with Graphics', () =>
    {
        const parent = new Container();

        const graphics = new Graphics();

        graphics.beginFill(0xFF0000).drawCircle(0, 0, 10);

        parent.addChild(graphics);

        const bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(-10);
        expect(bounds.y).to.equal(-10);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);
    });

    it('should register correct local-bounds with Graphics after clear', () =>
    {
        const parent = new Container();

        const graphics = new Graphics();

        graphics.beginFill(0xFF0000).drawRect(0, 0, 20, 20);

        parent.addChild(graphics);

        let bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        graphics.clear();
        graphics.beginFill(0xFF, 1);
        graphics.drawRect(0, 0, 10, 10);
        graphics.endFill();

        bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it('should register correct local-bounds with Graphics after generateCanvasTexture and clear', () =>
    {
        const parent = new Container();

        const graphics = new Graphics();

        graphics.beginFill(0xFF0000).drawRect(0, 0, 20, 20);

        parent.addChild(graphics);

        let bounds = graphics.getLocalBounds();

        graphics.generateCanvasTexture();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        graphics.clear();
        graphics.beginFill(0xFF, 1);
        graphics.drawRect(0, 0, 10, 10);
        graphics.endFill();

        bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it('should register correct local-bounds with an empty Container', () =>
    {
        const parent = new Container();

        const container = new Container();

        parent.addChild(container);

        const bounds = container.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);
    });

    it('should register correct local-bounds with an item that has already had its parent Container transformed', () =>
    {
        const parent = new Container();

        const container = new Container();

        const graphics = new Graphics().beginFill(0xFF0000).drawRect(0, 0, 10, 10);

        parent.addChild(container);
        container.addChild(graphics);

        container.position.x = 100;
        container.position.y = 100;

        const bounds = container.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it('should register correct local-bounds with a Mesh', withGL(() =>
    {
        const parent = new Container();

        const texture = RenderTexture.create({ width: 10, height: 10 });

        const plane = new SimplePlane(texture);

        parent.addChild(plane);

        plane.position.x = 20;
        plane.position.y = 20;

        const bounds = plane.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    }));

    it('should register correct local-bounds with a cachAsBitmap item inside after a render', () =>
    {
        const parent = new Container();

        const graphic = new Graphics();

        graphic.beginFill(0xffffff);
        graphic.drawRect(0, 0, 100, 100);
        graphic.endFill();
        graphic.cacheAsBitmap = true;

        parent.addChild(graphic);

        const renderer = new CanvasRenderer({
            width: 100,
            height: 100,
        });

        // @ts-expect-error ---
        renderer.sayHello = () => { /* empty */ };
        renderer.render(parent);

        const bounds = parent.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(100);
        expect(bounds.height).to.equal(100);
    });

    it('should register correct local-bounds with a Text', () =>
    {
        const text = new Text('hello');
        const bounds = text.getLocalBounds();

        expect(bounds.width).to.not.equal(0);
        expect(bounds.height).to.not.equal(0);
    });
});
