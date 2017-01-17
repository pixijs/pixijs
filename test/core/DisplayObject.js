'use strict';

describe('PIXI.DisplayObject', function ()
{
    describe('constructor', function ()
    {
        it('should initialise properties', function ()
        {
            const object = new PIXI.DisplayObject();

            expect(object.alpha).to.equal(1);
            expect(object.worldAlpha).to.equal(1);
            expect(object.renderable).to.be.true;
            expect(object.visible).to.be.true;
        });

        it('should set the correct Transform', function ()
        {
            PIXI.settings.TRANSFORM_MODE = PIXI.TRANSFORM_MODE.DYNAMIC;

            const dynamicTransform = new PIXI.DisplayObject();

            expect(dynamicTransform.transform).to.be.instanceof(PIXI.Transform);

            PIXI.settings.TRANSFORM_MODE = PIXI.TRANSFORM_MODE.STATIC;

            const staticTransform = new PIXI.DisplayObject();

            expect(staticTransform.transform).to.be.instanceof(PIXI.TransformStatic);
        });
    });

    describe('setParent', function ()
    {
        it('should add itself to a Container', function ()
        {
            const child = new PIXI.DisplayObject();
            const container = new PIXI.Container();

            expect(container.children.length).to.equal(0);
            child.setParent(container);
            expect(container.children.length).to.equal(1);
            expect(child.parent).to.equal(container);
        });

        it('should throw if not Container', function ()
        {
            const child = new PIXI.DisplayObject();
            const notAContainer = {};

            expect(() => child.setParent()).to.throw('setParent: Argument must be a Container');
            expect(() => child.setParent(notAContainer)).to.throw('setParent: Argument must be a Container');
        });
    });

    describe('setTransform', function ()
    {
        it('should set correct properties', function ()
        {
            const object = new PIXI.DisplayObject();

            object.setTransform(1, 2, 3, 4, 5, 6, 7, 8, 9);

            expect(object.position.x).to.be.equal(1);
            expect(object.position.y).to.be.equal(2);
            expect(object.scale.x).to.be.equal(3);
            expect(object.scale.y).to.be.equal(4);
            expect(object.rotation).to.be.equal(5);
            expect(object.skew.x).to.be.equal(6);
            expect(object.skew.y).to.be.equal(7);
            expect(object.pivot.x).to.be.equal(8);
            expect(object.pivot.y).to.be.equal(9);
        });

        it('should convert zero scale to one', function ()
        {
            const object = new PIXI.DisplayObject();

            object.setTransform(1, 1, 0, 0, 1, 1, 1, 1, 1);

            expect(object.scale.x).to.be.equal(1);
            expect(object.scale.y).to.be.equal(1);
        });
    });

    describe('worldVisible', function ()
    {
        it('should traverse parents', function ()
        {
            const grandParent = new PIXI.Container();
            const parent = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            grandParent.addChild(parent);
            parent.addChild(child);

            expect(child.worldVisible).to.be.true;

            grandParent.visible = false;

            expect(child.worldVisible).to.be.false;
        });
    });
});
