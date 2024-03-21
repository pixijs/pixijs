// SimpleListen.test.ts

import { SimpleListen } from '../src/utils/SimpleListen';

describe('SimpleListen', () =>
{
    test('add method adds a listener', () =>
    {
        const simpleListen = new SimpleListen({});
        const listener = jest.fn();

        simpleListen.add(1, listener);
        expect(simpleListen['_map'][1]).toBe(listener);
    });

    test('remove method removes a listener', () =>
    {
        const simpleListen = new SimpleListen({});
        const listener = jest.fn();

        simpleListen.add(1, listener);
        simpleListen.remove(1);
        expect(simpleListen['_map'][1]).toBeNull();
    });

    test('emit method calls all listeners with the target', () =>
    {
        const target = {};
        const simpleListen = new SimpleListen(target);

        const listener1 = jest.fn();
        const listener2 = jest.fn();

        simpleListen.add(1, listener1);
        simpleListen.add(2, listener2);

        simpleListen.emit();

        expect(listener1).toHaveBeenCalledWith(target);
        expect(listener2).toHaveBeenCalledWith(target);
    });

    test('emit does not call removed listeners', () =>
    {
        const target = {};
        const simpleListen = new SimpleListen(target);

        const listener1 = jest.fn();
        const listener2 = jest.fn();

        simpleListen.add(1, listener1);
        simpleListen.add(2, listener2);
        simpleListen.remove(1);

        simpleListen.emit();

        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).toHaveBeenCalledWith(target);
    });
});
