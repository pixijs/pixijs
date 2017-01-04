'use strict';

describe('PIXI.Text', function ()
{
    describe('getFontStyle', function ()
    {
        it('should be a valid API', function ()
        {
            expect(PIXI.Text.getFontStyle).to.be.a.function;
        });

        it('should assume pixel fonts', function ()
        {
            const style = PIXI.Text.getFontStyle({ fontSize: 72 });

            expect(style).to.be.a.string;
            expect(style).to.have.string(' 72px ');
        });

        it('should handle multiple fonts as array', function ()
        {
            const style = PIXI.Text.getFontStyle({
                fontFamily: ['Georgia', 'Arial', 'sans-serif'],
            });

            expect(style).to.have.string('"Georgia","Arial","sans-serif"');
        });

        it('should handle multiple fonts as string', function ()
        {
            const style = PIXI.Text.getFontStyle({
                fontFamily: 'Georgia, "Arial", sans-serif',
            });

            expect(style).to.have.string('"Georgia","Arial","sans-serif"');
        });
    });

    describe('destroy', function ()
    {
        it('should call through to Sprite.destroy', function ()
        {
            const text = new PIXI.Text('foo');

            expect(text.anchor).to.not.equal(null);
            text.destroy();
            expect(text.anchor).to.equal(null);
        });

        it('should set context to null', function ()
        {
            const text = new PIXI.Text('foo');

            expect(text.style).to.not.equal(null);
            text.destroy();
            expect(text.style).to.equal(null);
        });

        it('should destroy children if children flag is set', function ()
        {
            const text = new PIXI.Text('foo');
            const child = new PIXI.DisplayObject();

            text.addChild(child);
            text.destroy({ children: true });
            expect(text.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should accept options correctly', function ()
        {
            const text = new PIXI.Text('foo');
            const child = new PIXI.DisplayObject();

            text.addChild(child);
            text.destroy(true);
            expect(text.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should pass opts on to children if children flag is set', function ()
        {
            const text = new PIXI.Text('foo');
            const child = new PIXI.DisplayObject();
            var childDestroyOpts;

            child.destroy = function (opts)
            {
                childDestroyOpts = opts;
            };

            text.addChild(child);
            text.destroy({ children: true, texture: true });
            expect(childDestroyOpts).to.deep.equal({ children: true, texture: true, baseTexture: true });
        });

        it('should modify the height of the object when setting height', function ()
        {
            const text = new PIXI.Text('foo');

            text.height = 300;

            expect(text.height).to.equal(300);
        });

        it('should modify the width of the object when setting width', function ()
        {
            const text = new PIXI.Text('foo');

            text.width = 300;

            expect(text.width).to.equal(300);
        });
    });
});
