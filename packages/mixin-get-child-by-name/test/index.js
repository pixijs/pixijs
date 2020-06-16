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

    it('should correctly find a child by its name', function ()
    {
        const obj = new DisplayObject();
        const parent = new Container();

        obj.name = 'foo';
        parent.addChild(obj);

        expect(parent.getChildByName('foo')).to.equal(obj);
    });

    it('should correctly find a indirect child by its name in recursive search', function ()
    {
        const obj = new DisplayObject();
        const parent = new Container();
        const grandParent = new Container();

        obj.name = 'foo';
        parent.addChild(obj);
        grandParent.addChild(obj);

        expect(grandParent.getChildByName('foo', true)).to.equal(obj);
    });
});
