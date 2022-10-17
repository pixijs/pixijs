import { Container } from '@pixi/display';
import { RenderTexture, BaseRenderTexture, Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Rectangle } from '@pixi/math';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';

describe('getBounds', () =>
{
    it('should register correct width/height with a LOADED Sprite', () =>
    {
        const parent = new Container();
        const texture = RenderTexture.create({ width: 10, height: 10 });

        const sprite = new Sprite(texture);

        parent.addChild(sprite);

        let bounds = sprite.getBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        bounds = sprite.getBounds();

        expect(bounds.x).toEqual(20);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(20);
        expect(bounds.height).toEqual(20);

        bounds = sprite.getBounds(true);

        expect(bounds.x).toEqual(20);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(20);
        expect(bounds.height).toEqual(20);
    });

    it('should register correct width/height with Graphics', () =>
    {
        const parent = new Container();
        const graphics = new Graphics();

        let bounds = graphics.getBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(0);
        expect(bounds.height).toEqual(0);

        graphics.beginFill(0xFF0000).drawCircle(0, 0, 10);

        parent.addChild(graphics);

        bounds = graphics.getBounds();

        expect(bounds.x).toEqual(-10);
        expect(bounds.y).toEqual(-10);
        expect(bounds.width).toEqual(20);
        expect(bounds.height).toEqual(20);

        graphics.position.x = 20;
        graphics.position.y = 20;

        graphics.scale.x = 2;
        graphics.scale.y = 2;

        bounds = graphics.getBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(40);
        expect(bounds.height).toEqual(40);

        bounds = graphics.getBounds(true);

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(40);
        expect(bounds.height).toEqual(40);
    });

    it('should register correct width/height with an empty Container', () =>
    {
        const parent = new Container();

        const container = new Container();

        parent.addChild(container);

        let bounds = container.getBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(0);
        expect(bounds.height).toEqual(0);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        bounds = container.getBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(0);
        expect(bounds.height).toEqual(0);
    });

    it('should register correct width/height with a Container', () =>
    {
        const parent = new Container();

        const container = new Container();

        const graphics = new Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10);

        const texture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(texture);

        container.addChild(sprite);
        container.addChild(graphics);

        parent.addChild(container);

        sprite.position.x = 30;
        sprite.position.y = 20;
        graphics.position.x = 100;
        graphics.position.y = 100;

        let bounds = container.getBounds();

        expect(bounds.x).toEqual(30);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(80);
        expect(bounds.height).toEqual(90);

        container.rotation = 0.1;

        bounds = container.getBounds();

        expect(bounds.x | 0).toEqual(26);
        expect(bounds.y | 0).toEqual(22);
        expect(bounds.width | 0).toEqual(73);
        expect(bounds.height | 0).toEqual(97);

        bounds = container.getBounds(true);

        expect(bounds.x | 0).toEqual(26);
        expect(bounds.y | 0).toEqual(22);
        expect(bounds.width | 0).toEqual(73);
        expect(bounds.height | 0).toEqual(97);
    });

    it('should register correct width/height with an item that has already had its parent Container transformed', () =>
    {
        const parent = new Container();

        const container = new Container();

        const graphics = new Graphics().beginFill(0xFF0000).drawRect(0, 0, 10, 10);

        parent.addChild(container);
        container.addChild(graphics);

        container.position.x = 100;
        container.position.y = 100;

        let bounds = container.getBounds();

        expect(bounds.x).toEqual(100);
        expect(bounds.y).toEqual(100);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);

        bounds = graphics.getBounds(true);

        expect(bounds.x).toEqual(100);
        expect(bounds.y).toEqual(100);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);
    });

    /*
    it('should register correct width/height with a Mesh', ()=>
    {
        const parent = new Container();

        const texture = RenderTexture.create({ width: 10, height: 10 });

        const plane = new SimplePlane(texture);

        parent.addChild(plane);

        plane.position.x = 20;
        plane.position.y = 20;

        let bounds = plane.getBounds();

        expect(bounds.x).toEqual(20);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);

        plane.scale.x = 2;
        plane.scale.y = 2;

        bounds = plane.getBounds();

        expect(bounds.x).toEqual(20);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(20);
        expect(bounds.height).toEqual(20);
    });
    */

    it('should register correct width/height with an a DisplayObject is visible false', () =>
    {
        const parent = new Container();

        const container = new Container();

        const graphics = new Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10);

        const texture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(texture);

        container.addChild(sprite);
        container.addChild(graphics);

        parent.addChild(container);

        sprite.position.x = 30;
        sprite.position.y = 20;
        graphics.position.x = 100;
        graphics.position.y = 100;

        graphics.visible = false;

        let bounds = container.getBounds();

        expect(bounds.x).toEqual(30);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);

        sprite.renderable = false;

        bounds = container.getBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(0);
        expect(bounds.height).toEqual(0);

        bounds = sprite.getBounds();

        expect(bounds.x).toEqual(30);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);
    });

    it('should register correct bounds of invisible Container', () =>
    {
        const parent = new Container();

        const container = new Container();

        const texture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(texture);

        container.addChild(sprite);
        parent.addChild(container);

        sprite.position.set(30, 20);
        container.visible = false;
        container.position.set(100, 100);

        const bounds = container.getBounds();

        expect(bounds.x).toEqual(130);
        expect(bounds.y).toEqual(120);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);
    });

    it('should register correct width/height with Container masked child', () =>
    {
        const parent = new Container();

        const container = new Container();

        const graphics = new Graphics().beginFill(0xFF0000).drawRect(0, 0, 10, 10);

        const texture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(texture);

        container.addChild(sprite);
        container.addChild(graphics);
        sprite.mask = graphics;

        parent.addChild(container);

        sprite.position.x = 30;
        sprite.position.y = 20;
        graphics.position.x = 32;
        graphics.position.y = 23;

        let bounds = graphics.getBounds();

        expect(bounds.x).toEqual(32);
        expect(bounds.y).toEqual(23);
        expect(bounds.width).toEqual(10);
        expect(bounds.height).toEqual(10);

        bounds = container.getBounds();

        expect(bounds.x).toEqual(32);
        expect(bounds.y).toEqual(23);
        expect(bounds.width).toEqual(8);
        expect(bounds.height).toEqual(7);
    });

    it('should register correct width/height with an a DisplayObject parent has moved', () =>
    {
        const parent = new Container();

        const container = new Container();

        const graphics = new Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10);

        container.addChild(graphics);

        parent.addChild(container);

        //  graphics.position.x = 100;
        //  graphics.position.y = 100;
        container.position.x -= 100;
        container.position.y -= 100;

        const bounds = graphics.getBounds();

        expect(bounds.x).toEqual(-110);
        expect(bounds.y).toEqual(-110);
        expect(bounds.width).toEqual(20);
        expect(bounds.height).toEqual(20);
    });

    it('should register correct width/height with a Text Object', () =>
    {
        const parent = new Container();

        const container = new Container();

        const text = new Text('i am some text');

        container.addChild(text);

        parent.addChild(container);

        let bounds = text.getBounds();
        const bx = bounds.width;

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toBeGreaterThan(0);
        expect(bounds.height).toBeGreaterThan(0);

        text.text = 'hello!';

        bounds = text.getBounds();

        // this variable seems to be different on different devices. a font thing?
        expect(bounds.width).not.toEqual(bx);
    });

    it('should return a different rectangle if getting local bounds after global bounds ', () =>
    {
        const parent = new Container();
        const texture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(texture);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        parent.addChild(sprite);

        const bounds = sprite.getBounds();

        expect(bounds.x).toEqual(20);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(20);
        expect(bounds.height).toEqual(20);

        const localBounds = sprite.getLocalBounds();

        expect(Math.abs(localBounds.x)).toEqual(0);
        expect(Math.abs(localBounds.y)).toEqual(0);
        expect(localBounds.width).toEqual(10);
        expect(localBounds.height).toEqual(10);
    });

    it('should ensure bounds respect the trim of a texture ', () =>
    {
        const parent = new Container();
        const baseTexture = new BaseRenderTexture({
            width: 100,
            height: 100,
        });

        const orig = new Rectangle(0, 0, 100, 50);
        const frame = new Rectangle(2, 2, 50, 50);
        const trim = new Rectangle(25, 0, 50, 50);

        const trimmedTexture = new Texture(baseTexture, frame, orig, trim);

        const sprite = new Sprite(trimmedTexture);

        sprite.position.x = 20;
        sprite.position.y = 20;

        parent.addChild(sprite);

        const bounds = sprite.getBounds();

        expect(bounds.x).toEqual(20);
        expect(bounds.y).toEqual(20);
        expect(bounds.width).toEqual(100);
        expect(bounds.height).toEqual(50);
    });
});
