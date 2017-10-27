const { accessibleTarget } = require('../');
const { DisplayObject } = require('@pixi/display');
const { mixins } = require('@pixi/utils');

describe('PIXI.accessibility.accessibleTarget', function()
{
    it('should have target public properties', function()
    {
        expect(accessibleTarget.accessible).to.be.a.boolean;
        expect(accessibleTarget.accessible).to.be.false;
        expect(accessibleTarget.accessibleTitle).to.be.null;
        expect(accessibleTarget.accessibleHint).to.be.null;
        expect(accessibleTarget.tabIndex).to.equal(0);
    });

    it('should not have properties before mixin', function()
    {
        const obj = new DisplayObject();
        expect(obj.accessible).to.be.undefined;
        expect(obj.accessibleTitle).to.be.undefined;
        expect(obj.tabIndex).to.be.undefined;
    });

    it('should add properties after mixin', function()
    {
        mixins.performMixins();
        const obj = new DisplayObject();
        expect(obj.accessible).to.be.a.boolean;
        expect(obj.accessible).to.be.false;
        expect(obj.accessibleTitle).to.be.null;
        expect(obj.accessibleHint).to.be.null;
        expect(obj.tabIndex).to.equal(0);
    });
});
