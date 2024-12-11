import { Container } from '../Container';

describe('Container#Label', () =>
{
    it('should contain property', () =>
    {
        const obj = new Container();

        expect(obj.label).toBeDefined();
        expect(obj.label).toBeNull();
    });
});

describe('Container#getChildByLabel', () =>
{
    it('should exist', () =>
    {
        const parent = new Container();

        expect(parent.getChildByLabel).toBeDefined();
        expect(parent.getChildByLabel).toBeInstanceOf(Function);
    });

    it('should correctly find a child by its Label', () =>
    {
        const obj = new Container();
        const parent = new Container();

        obj.label = 'foo';
        parent.addChild(obj);

        expect(parent.getChildByLabel('foo')).toEqual(obj);
    });

    it('should correctly find a indirect child by its Label in deep search', () =>
    {
        const obj = new Container();
        const parent = new Container();
        const grandParent = new Container();

        obj.label = 'foo';
        parent.addChild(obj);
        grandParent.addChild(parent);

        expect(grandParent.getChildByLabel('foo', true)).toEqual(obj);
    });

    it('should return null if Label does not exist', () =>
    {
        const root = new Container();

        root.addChild(new Container());
        root.addChild(new Container());

        expect(root.getChildByLabel('mock-Label', true)).toEqual(null);
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

        expect(stage.getChildByLabel('mock-target', true)).toEqual(uncle);
    });
});
