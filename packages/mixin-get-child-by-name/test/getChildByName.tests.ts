import { DisplayObject, Container } from '@pixi/display';
import { expect } from 'chai';

import '@pixi/mixin-get-child-by-name';

describe('DisplayObject#name', () =>
{
    it('should contain property', () =>
    {
        // @ts-expect-error - instantiating DisplayObject
        const obj = new DisplayObject();

        expect(obj.name).to.be.not.undefined;
        expect(obj.name).to.be.null;
    });
});

describe('Container#getChildByName', () =>
{
    it('should exist', () =>
    {
        const parent = new Container();

        expect(parent.getChildByName).to.be.not.undefined;
        expect(parent.getChildByName).to.be.a('function');
    });

    it('should correctly find a child by its name', () =>
    {
        // @ts-expect-error - instantiating DisplayObject
        const obj = new DisplayObject();
        const parent = new Container();

        obj.name = 'foo';
        parent.addChild(obj);

        expect(parent.getChildByName('foo')).to.equal(obj);
    });

    it('should correctly find a indirect child by its name in deep search', () =>
    {
        // @ts-expect-error - instantiating DisplayObject
        const obj = new DisplayObject();
        const parent = new Container();
        const grandParent = new Container();

        obj.name = 'foo';
        parent.addChild(obj);
        grandParent.addChild(parent);

        expect(grandParent.getChildByName('foo', true)).to.equal(obj);
    });

    it('should return null if name does not exist', () =>
    {
        const root = new Container();

        // @ts-expect-error - instantiating DisplayObject
        root.addChild(new DisplayObject());
        root.addChild(new Container());

        expect(root.getChildByName('mock-name', true)).to.equal(null);
    });

    it('should return the match highest in the hierarchy', () =>
    {
        const stage = new Container();
        const root = stage.addChild(new Container());
        const parent = root.addChild(new Container());
        // @ts-expect-error - instantiating DisplayObject
        const uncle = root.addChild(new DisplayObject());
        // @ts-expect-error - instantiating DisplayObject
        const target = new DisplayObject();

        parent.name = 'mock-parent';
        uncle.name = 'mock-target';
        target.name = 'mock-target';

        expect(stage.getChildByName('mock-target', true)).to.equal(uncle);
    });
});
