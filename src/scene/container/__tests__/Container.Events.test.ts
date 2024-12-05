import { Container } from '../Container';

describe('Container Events', () =>
{
    it('should trigger "added", "removed", "childAdded", and "childRemoved" events on itself and children', () =>
    {
        const container = new Container();
        const child = new Container();
        let triggeredAdded = false;
        let triggeredRemoved = false;
        let triggeredChildAdded = false;
        let triggeredChildRemoved = false;

        child.on('added', (to: Container) =>
        {
            triggeredAdded = true;
            expect(container.children.length).toEqual(1);
            expect(child.parent).toEqual(to);
        });
        child.on('removed', (from: Container) =>
        {
            triggeredRemoved = true;
            expect(container.children.length).toEqual(0);
            expect(child.parent).toBeNull();
            expect(container).toEqual(from);
        });

        container.on('childAdded', (childAdded, containerFrom, index) =>
        {
            triggeredChildAdded = true;
            expect(child).toEqual(childAdded);
            expect(container).toEqual(containerFrom);
            expect(index).toEqual(0);
        });
        container.on('childRemoved', (childRemoved, containerFrom, index) =>
        {
            triggeredChildRemoved = true;
            expect(child).toEqual(childRemoved);
            expect(container).toEqual(containerFrom);
            expect(index).toEqual(0);
        });

        container.addChild(child);
        expect(triggeredAdded).toBe(true);
        expect(triggeredRemoved).toBe(false);
        expect(triggeredChildAdded).toBe(true);
        expect(triggeredChildRemoved).toBe(false);

        container.removeChild(child);
        expect(triggeredRemoved).toBe(true);
        expect(triggeredChildRemoved).toBe(true);
    });

    describe('remove', () =>
    {
        it('should trigger removed listeners', () =>
        {
            const listener = jest.fn();
            const child = new Container();
            const container = new Container();

            child.on('removed', listener);

            container.addChild(child);
            container.removeChild(child);

            expect(listener).toHaveBeenCalledTimes(1);

            container.addChild(child);
            child.removeFromParent();

            expect(listener).toHaveBeenCalledTimes(2);

            container.addChild(child);
            child.destroy();

            expect(listener).toHaveBeenCalledTimes(3);
        });
    });

    describe('destroy', () =>
    {
        it('should trigger destroyed listeners', () =>
        {
            const listener = jest.fn();
            const child = new Container();
            const container = new Container();

            child.on('destroyed', listener);

            container.addChild(child);
            container.removeChild(child);

            expect(listener).not.toHaveBeenCalled();

            container.addChild(child);
            child.destroy();

            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('should trigger destroyed listeners once destruction is complete', () =>
        {
            let listenerCallCount = 0;
            const child = new Container();
            const container = new Container();

            child.on('destroyed', () =>
            {
                listenerCallCount++;
                expect(child.destroyed).toBe(true);
                expect(child.parent).toBeNull();
            });

            container.addChild(child);
            container.removeChild(child);

            expect(listenerCallCount).toEqual(0);

            container.addChild(child);
            child.destroy();

            expect(listenerCallCount).toEqual(1);
        });
    });
});
