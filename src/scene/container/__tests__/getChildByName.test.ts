import { Container } from '../Container';
// import '../../src/scene/container/container-mixins/findMixin';

describe('Container#name', () =>
{
    it('should contain property', () =>
    {
        const obj = new Container();

        expect(obj.label).toBeDefined();
        expect(obj.label).toBeNull();
    });
});

describe('Container#getChildByName', () =>
{
    it('should exist', () =>
    {
        const parent = new Container();

        expect(parent.getChildByName).toBeDefined();
        expect(parent.getChildByName).toBeInstanceOf(Function);
    });

    it('should correctly find a child by its name', () =>
    {
        const obj = new Container();
        const parent = new Container();

        obj.label = 'foo';
        parent.addChild(obj);

        expect(parent.getChildByName('foo')).toEqual(obj);
    });

    it('should correctly find a indirect child by its name in deep search', () =>
    {
        const obj = new Container();
        const parent = new Container();
        const grandParent = new Container();

        obj.label = 'foo';
        parent.addChild(obj);
        grandParent.addChild(parent);

        expect(grandParent.getChildByName('foo', true)).toEqual(obj);
    });

    it('should return null if name does not exist', () =>
    {
        const root = new Container();

        root.addChild(new Container());
        root.addChild(new Container());

        expect(root.getChildByName('mock-name', true)).toEqual(null);
    });

    it('should return the match highest in the hierarchy', () =>
    {
        const stage = new Container();
        const root = stage.addChild(new Container());
        const parent = root.addChild(new Container());
        const uncle = root.addChild(new Container());
        const target = new Container();

        parent.label = 'mock-parent';
        uncle.label = 'mock-target';
        target.label = 'mock-target';

        expect(stage.getChildByName('mock-target', true)).toEqual(uncle);
    });
});
