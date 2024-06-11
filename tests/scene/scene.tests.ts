import { Container } from '../../src/scene/container/Container';

describe('Scene', () =>
{
    it('should add a child', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);

        expect(container.children).toHaveLength(1);
        expect(container.children[0]).toEqual(child);
    });

    it('should remove a child', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);

        container.removeChild(child);

        expect(container.children).toHaveLength(0);
    });

    it('should not remove a child if it does not belong to the parent container', async () =>
    {
        const container = new Container();
        const actualContainer = new Container();

        const child = new Container();

        actualContainer.addChild(child);

        container.removeChild(child);

        expect(container.children).toHaveLength(0);
        expect(actualContainer.children).toHaveLength(1);

        expect(child.parent).toEqual(actualContainer);
    });

    it('should re-parent a child', async () =>
    {
        const container = new Container();

        const child = new Container();
        const child2 = new Container();

        container.addChild(child);
        container.addChild(child2);

        child.addChild(child2);

        expect(container.children).toHaveLength(1);
        expect(child.children).toHaveLength(1);
    });

    it('should add a child twice with no duplication', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);
        container.addChild(child);
        expect(container.children).toHaveLength(1);

        container.removeChild(child);

        expect(container.children).toHaveLength(0);
        expect(child.parent).toEqual(null);
        // container.removeChild(child);
    });
});

