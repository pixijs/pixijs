const { Text } = require('../');
const { Sprite } = require('@pixi/sprite');
const { skipHello } = require('@pixi/utils');
const { settings } = require('@pixi/settings');
const { CanvasRenderer } = require('@pixi/canvas-renderer');
const { CanvasSpriteRenderer } = require('@pixi/canvas-sprite');

require('@pixi/canvas-display');

skipHello();

CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

describe('PIXI.Text', function ()
{
    describe('properties', function ()
    {
        it('should modify the height of the object when setting height', function ()
        {
            const text = new Text('foo');

            text.height = 300;

            expect(text.height).to.equal(300);
        });

        it('should modify the width of the object when setting width', function ()
        {
            const text = new Text('foo');

            text.width = 300;

            expect(text.width).to.equal(300);
        });

        it('should set the text resolution to match the resolution setting when constructed time', function ()
        {
            const text = new Text('foo');

            expect(text.resolution).to.equal(settings.RESOLUTION);
        });

        it('should update the text resolution to match the renderer resolution when being rendered to screen', function ()
        {
            const text = new Text('foo');

            expect(text.resolution).to.equal(settings.RESOLUTION);

            const renderer = new CanvasRenderer({ resolution: 2 });

            renderer.render(text);

            expect(text.resolution).to.equal(renderer.resolution);

            renderer.destroy();
        });

        it('should use any manually set text resolution over the renderer resolution', function ()
        {
            const text = new Text('foo');

            text.resolution = 3;

            expect(text.resolution).to.equal(3);

            const renderer = new CanvasRenderer({ resolution: 2 });

            renderer.render(text);

            expect(text.resolution).to.equal(3);

            renderer.destroy();
        });
    });

    describe('destroy', function ()
    {
        it('should now clear canvas size on imported canvas', function ()
        {
            const canvas = document.createElement('canvas');
            const text = new Text('blah', {}, canvas);
            const { width, height } = canvas;

            text.destroy();

            expect(canvas.width).to.equal(width);
            expect(canvas.height).to.equal(height);
        });

        it('should clear size on owned canvas during destroy', function ()
        {
            const text = new Text('blah', {});
            const { canvas } = text;

            text.destroy();

            expect(canvas.width).to.equal(0);
            expect(canvas.height).to.equal(0);
        });

        it('should call through to Sprite.destroy', function ()
        {
            const text = new Text('foo');

            expect(text.anchor).to.not.equal(null);
            text.destroy();
            expect(text.anchor).to.equal(null);
        });

        it('should set context to null', function ()
        {
            const text = new Text('foo');

            expect(text.style).to.not.equal(null);
            text.destroy();
            expect(text.style).to.equal(null);
        });

        it('should destroy children if children flag is set', function ()
        {
            const text = new Text('foo');
            const child = new Sprite();

            text.addChild(child);
            text.destroy({ children: true });
            expect(text.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should accept options correctly', function ()
        {
            const text = new Text('foo');
            const child = new Sprite();

            text.addChild(child);
            text.destroy(true);
            expect(text.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should pass opts on to children if children flag is set', function ()
        {
            const text = new Text('foo');
            const child = new Sprite();
            let childDestroyOpts;

            child.destroy = function (opts)
            {
                childDestroyOpts = opts;
            };

            text.addChild(child);
            text.destroy({ children: true, texture: true });
            expect(childDestroyOpts).to.deep.equal({ children: true, texture: true, baseTexture: true });
        });
    });

    describe('text', function ()
    {
        it('should convert numbers into strings', function ()
        {
            const text = new Text(2);

            expect(text.text).to.equal('2');
        });

        it('should not change 0 to \'\'', function ()
        {
            const text = new Text(0);

            expect(text.text).to.equal('0');
        });

        it('should prevent setting null', function ()
        {
            const text = new Text(null);

            expect(text.text).to.equal('');
        });

        it('should prevent setting undefined', function ()
        {
            const text = new Text();

            expect(text.text).to.equal('');
        });

        it('should trim an empty string', function ()
        {
            const text = new Text('', { trim: true });

            expect(text.text).to.equal('');
        });

        it('should allow setting \'\' for v5', function ()
        {
            const text = new Text('');

            expect(text.text).to.equal('');
        });

        it('should keep at least 1 pixel for canvas width and height', function ()
        {
            const text = new Text('');

            text.updateText();

            expect(text.canvas.width).to.be.above(1);
            expect(text.canvas.height).to.be.above(1);

            text.text = '\n';

            expect(text.canvas.width).to.be.above(1);
        });
    });
});
