import { Container } from '../../src/rendering/scene/Container';

describe('Depth sorting', () =>
{
    it('should depth sort children correctly', async () =>
    {
        const container = new Container();

        const child1 = new Container();
        const child2 = new Container();
        const child3 = new Container();

        container.addChild(child1);
        container.addChild(child2);
        container.addChild(child3);

        expect(container.sortableChildren).toBe(false);
        expect(container.sortDirty).toBe(false);

        child3.zIndex = -1;

        expect(container.sortableChildren).toBe(true);
        expect(container.sortDirty).toBe(true);

        container.sortChildren();

        expect(container.sortDirty).toBe(false);
        expect(container.sortableChildren).toBe(true);

        expect(container.children[0]).toBe(child3);
        expect(container.children[1]).toBe(child1);
        expect(container.children[2]).toBe(child2);
    });

    it('should activate depth sort if a child is added with a zIndex set', async () =>
    {
        const container = new Container();

        const child1 = new Container();
        const child2 = new Container();
        const child3 = new Container();

        child1.zIndex = 4;

        container.addChild(child1);
        container.addChild(child2);
        container.addChild(child3);

        expect(container.sortableChildren).toBe(true);
        expect(container.sortDirty).toBe(true);
    });
});
