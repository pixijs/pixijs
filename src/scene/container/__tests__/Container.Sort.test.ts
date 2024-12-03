import { Container } from '../Container';

describe('Container Sort', () =>
{
    describe('sortDirty', () =>
    {
        it('should set sortDirty flag to true when adding a new child', () =>
        {
            const parent = new Container();
            const child = new Container();

            parent.sortableChildren = true;

            expect(parent.sortDirty).toBe(false);

            parent.addChild(child);

            expect(parent.sortDirty).toBe(true);
        });

        it('should set sortDirty flag to true when changing a child zIndex', () =>
        {
            const parent = new Container();
            const child = new Container();

            parent.addChild(child);

            parent.sortDirty = false;

            child.zIndex = 10;

            expect(parent.sortDirty).toBe(true);
        });
    });

    describe('sortChildren', () =>
    {
        it('should reset sortDirty flag', () =>
        {
            const container = new Container();

            container.sortDirty = true;

            container.sortChildren();

            expect(container.sortDirty).toBe(false);
        });

        it('should call sort when at least one child has a zIndex', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const spy = jest.spyOn(container.children, 'sort' as any);

            child1.zIndex = 5;
            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).toHaveBeenCalled();
        });

        it('should not call sort when children have no zIndex', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const spy = jest.spyOn(container.children, 'sort' as any);

            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).not.toHaveBeenCalled();
        });

        it('should sort children by zIndex value', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(3);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(0);
        });

        it('should sort children by current array order if zIndex values match', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 20;
            child3.zIndex = 10;
            child4.zIndex = 10;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(0);
            expect(container.children.indexOf(child4)).toEqual(1);
        });

        it('should sort children in the same way despite being called multiple times', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 10;
            child2.zIndex = 15;
            child3.zIndex = 5;
            child4.zIndex = 0;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);

            child1.zIndex = 1;
            child2.zIndex = 1;
            child3.zIndex = 1;
            child4.zIndex = 1;

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);
        });

        it('should sort new children added correctly', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(0);
            expect(container.children.indexOf(child3)).toEqual(1);

            container.addChild(child4);

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(0);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(3);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(0);
        });

        it('should sort children after a removal correctly', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(3);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(0);

            container.removeChild(child3);

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);
        });
    });
});
