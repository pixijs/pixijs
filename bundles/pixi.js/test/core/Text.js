'use strict';

describe('PIXI.Text', function ()
{
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

    describe('text', function ()
    {
        it('should convert numbers into strings', function ()
        {
            const text = new PIXI.Text(2);

            expect(text.text).to.equal('2');
        });

        it('should not change 0 to \'\'', function ()
        {
            const text = new PIXI.Text(0);

            expect(text.text).to.equal('0');
        });

        it('should prevent setting null', function ()
        {
            const text = new PIXI.Text(null);

            expect(text.text).to.equal(' ');
        });

        it('should prevent setting undefined', function ()
        {
            const text = new PIXI.Text();

            expect(text.text).to.equal(' ');
        });

        it('should prevent setting \'\'', function ()
        {
            const text = new PIXI.Text('');

            expect(text.text).to.equal(' ');
        });
    });
});
