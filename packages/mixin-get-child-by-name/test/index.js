const { DisplayObject, Container } = require('@pixi/display');

require('../');

describe('PIXI.DisplayObject#name', function ()
{
    it('should contain property', function ()
    {
        const obj = new DisplayObject();

        expect(obj.name).to.be.not.undefined;
        expect(obj.name).to.be.null;
    });
});

describe('PIXI.Container#getChildByName', function ()
{
    it('should exist', function ()
    {
        const parent = new Container();

        expect(parent.getChildByName).to.be.not.undefined;
        expect(parent.getChildByName).to.be.function;
    });

    it('should enable getChildByName', function ()
    {
        const obj = new DisplayObject();
        const parent = new Container();

        obj.name = 'foo';
        parent.addChild(obj);
        expect(parent.getChildByName('foo')).to.equal(obj);
    });
});
