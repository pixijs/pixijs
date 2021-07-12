const { DisplayObject, Container } = require('@pixi/display');
const { expect } = require('chai');

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

    it('should correctly find a indirect child by its name in deep search', function ()
    {
        const obj = new DisplayObject();
        const parent = new Container();
        const grandParent = new Container();

        obj.name = 'foo';
        parent.addChild(obj);
        grandParent.addChild(parent);

        expect(grandParent.getChildByName('foo', true)).to.equal(obj);
    });

    it('should return null if name does not exist', function ()
    {
        const root = new Container();
        const displayObject = root.addChild(new DisplayObject());
        const container = root.addChild(new Container());

        expect(root.getChildByName('mock-name', true)).to.equal(null);
    });

    it('should return the match highest in the hierarchy', function ()
    {
        const stage = new Container();
        const root = stage.addChild(new Container());
        const parent = root.addChild(new Container());
        const uncle = root.addChild(new DisplayObject());
        const target = new DisplayObject();

        parent.name = 'mock-parent';
        uncle.name = 'mock-target';
        target.name = 'mock-target';

        expect(stage.getChildByName('mock-target', true)).to.equal(uncle);
    });
});
