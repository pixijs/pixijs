import { EventEmitter } from '../EventEmitter';

// The first half ports EventEmitter3's own suite (v5.0.1, MIT, https://github.com/primus/eventemitter3),
// so PixiJS's emitter keeps its behaviour. Dropped: the `util.inherits` case (ES classes can't be
// called without `new`) and a case that swaps `_events` for a foreign object.
describe('EventEmitter', () =>
{
    describe('EventEmitter3 compatibility', () =>
    {
        it('works with ES6 symbols', () =>
        {
            const e = new EventEmitter();
            const event = Symbol('cows');
            const unknown = Symbol('moo');
            const calls: string[] = [];

            function bar(onced: string)
            {
                expect(e.listenerCount(unknown)).toBe(0);
                expect(e.listeners(unknown)).toEqual([]);
                calls.push(onced);
            }

            function foo(arg: string)
            {
                expect(e.listenerCount(unknown)).toBe(0);
                expect(arg).toBe('bar');

                e.once(unknown, bar);

                expect(e.listenerCount(event)).toBe(1);
                expect(e.listeners(event)).toEqual([foo]);
                expect(e.listenerCount(unknown)).toBe(1);
                expect(e.listeners(unknown)).toEqual([bar]);

                e.removeListener(event);

                expect(e.listenerCount(event)).toBe(0);
                expect(e.listeners(event)).toEqual([]);
                expect(e.emit(unknown, 'foo')).toBe(true);
            }

            e.on(event, foo);

            expect(e.emit(unknown, 'bar')).toBe(false);
            expect(e.emit(event, 'bar')).toBe(true);
            expect(calls).toEqual(['foo']);
        });

        describe('emit', () =>
        {
            it('returns false when there are no listeners', () =>
            {
                const e = new EventEmitter();

                expect(e.emit('foo')).toBe(false);
                expect(e.emit('bar')).toBe(false);
            });

            it('emits with context', () =>
            {
                const context = { bar: 'baz' };
                const e = new EventEmitter();
                const fn = jest.fn(function listener(this: unknown, bar: string)
                {
                    expect(bar).toBe('bar');
                    expect(this).toBe(context);
                });

                e.on('foo', fn, context).emit('foo', 'bar');
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('emits with context and many arguments', () =>
            {
                const context = { bar: 'baz' };
                const e = new EventEmitter();
                const fn = jest.fn(function listener(this: unknown, bar: string)
                {
                    expect(bar).toBe('bar');
                    expect(this).toBe(context);
                });

                e.on('foo', fn, context).emit('foo', 'bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
                expect(fn).toHaveBeenCalledWith('bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
            });

            it('passes exactly the emitted arguments, to one listener or many', () =>
            {
                for (const listenerCount of [1, 4])
                {
                    const e = new EventEmitter();

                    for (let j = 0; j < 100; j++)
                    {
                        const args = new Array(j).fill(j);
                        const lengths: number[] = [];

                        for (let k = 0; k < listenerCount; k++)
                        {
                            e.once('args', (...received: unknown[]) => lengths.push(received.length));
                        }

                        e.emit('args', ...args);
                        expect(lengths).toEqual(new Array(listenerCount).fill(j));
                    }
                }
            });

            it('emits to several listeners, each with its own context', () =>
            {
                const e = new EventEmitter();
                const seen: unknown[] = [];

                e.on('foo', function first(this: unknown, bar: string) { seen.push(this, bar); }, { foo: 'bar' });
                e.on('foo', function second(this: unknown, bar: string) { seen.push(this, bar); }, { bar: 'baz' });
                e.emit('foo', 'bar');

                expect(seen).toEqual([{ foo: 'bar' }, 'bar', { bar: 'baz' }, 'bar']);
            });

            it('emits with different contexts', () =>
            {
                const e = new EventEmitter();
                let pattern = '';

                function writer(this: string) { pattern += `${this}`; }

                e.on('write', writer, 'foo');
                e.on('write', writer, 'baz');
                e.once('write', writer, 'bar');
                e.once('write', writer, 'banana');
                e.emit('write');

                expect(pattern).toBe('foobazbarbanana');
            });

            it('returns true when there are listeners', () =>
            {
                const e = new EventEmitter();
                let called = 0;

                e.on('foo', () => { called++; });

                expect(e.emit('foo')).toBe(true);
                expect(e.emit('foob')).toBe(false);
                expect(called).toBe(1);
            });

            it('receives the emitted arguments', () =>
            {
                const e = new EventEmitter();
                const date = new Date();
                const fn = jest.fn();

                e.on('data', fn);
                e.emit('data', 'foo', e, date);

                expect(fn).toHaveBeenCalledWith('foo', e, date);
                expect(fn.mock.calls[0].length).toBe(3);
            });

            it('emits to all listeners in the order they were added', () =>
            {
                const e = new EventEmitter();
                const pattern: string[] = [];

                e.on('foo', () => pattern.push('foo1'));
                e.on('foo', () => pattern.push('foo2'));
                e.emit('foo');

                expect(pattern).toEqual(['foo1', 'foo2']);
            });

            it.each(['hasOwnProperty', 'constructor', '__proto__', 'toString', 'toValue', 'unwatch', 'watch'])(
                'stores an event named after a known property: %s',
                (key) =>
                {
                    const e = new EventEmitter();
                    const fn = jest.fn();

                    e.on(key, fn).emit(key, key);
                    expect(fn).toHaveBeenCalledWith(key);
                }
            );
        });

        describe('listeners', () =>
        {
            it('returns an empty array when there are no listeners', () =>
            {
                expect(new EventEmitter().listeners('foo')).toEqual([]);
            });

            it('returns the listener functions', () =>
            {
                const e = new EventEmitter();

                function foo() { /* empty */ }

                e.on('foo', foo);
                expect(e.listeners('foo')).toEqual([foo]);
            });

            it('returns a copy', () =>
            {
                const e = new EventEmitter();

                function foo() { /* empty */ }

                e.on('foo', foo);
                e.listeners('foo').length = 0;
                expect(e.listeners('foo')).toEqual([foo]);
            });
        });

        describe('listenerCount', () =>
        {
            it('returns the number of listeners for an event', () =>
            {
                const e = new EventEmitter();

                expect(e.listenerCount(undefined)).toBe(0);
                expect(e.listenerCount('foo')).toBe(0);

                e.on('foo', () => { /* empty */ });
                expect(e.listenerCount('foo')).toBe(1);
                e.on('foo', () => { /* empty */ });
                expect(e.listenerCount('foo')).toBe(2);
            });
        });

        describe('on', () =>
        {
            it('throws when the listener is not a function', () =>
            {
                const e = new EventEmitter();

                expect(() => e.on('foo', 'bar' as any)).toThrow(new TypeError('The listener must be a function'));
            });
        });

        describe('once', () =>
        {
            it('only emits once', () =>
            {
                const e = new EventEmitter();
                let calls = 0;

                e.once('foo', () => { calls++; });
                for (let i = 0; i < 5; i++) e.emit('foo');

                expect(e.listeners('foo').length).toBe(0);
                expect(calls).toBe(1);
            });

            it('only emits once when emits are nested in the listener', () =>
            {
                const e = new EventEmitter();
                let calls = 0;

                e.once('foo', () =>
                {
                    calls++;
                    e.emit('foo');
                });
                e.emit('foo');

                expect(e.listeners('foo').length).toBe(0);
                expect(calls).toBe(1);
            });

            it('only emits once alongside other listeners', () =>
            {
                const e = new EventEmitter();
                let multi = 0;
                let foo = 0;
                let bar = 0;

                e.once('foo', () => { foo++; });
                e.once('foo', () => { bar++; });
                e.on('foo', () => { multi++; });
                for (let i = 0; i < 5; i++) e.emit('foo');

                expect(e.listeners('foo').length).toBe(1);
                expect(multi).toBe(5);
                expect(foo).toBe(1);
                expect(bar).toBe(1);
            });

            it('only emits once with context', () =>
            {
                const context = { foo: 'bar' };
                const e = new EventEmitter();
                const fn = jest.fn(function listener(this: unknown) { expect(this).toBe(context); });

                e.once('foo', fn, context).emit('foo', 'bar');
                e.emit('foo', 'bar');
                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith('bar');
            });
        });

        describe('removeListener', () =>
        {
            it('removes all listeners of an event when no listener is given', () =>
            {
                const e = new EventEmitter();

                e.on('foo', () => { /* empty */ });
                e.on('foo', () => { /* empty */ });

                expect(e.removeListener('foo')).toBe(e);
                expect(e.listeners('foo')).toEqual([]);
            });

            it('removes only the listeners matching the given function', () =>
            {
                const e = new EventEmitter();

                function foo() { /* empty */ }
                function bar() { /* empty */ }
                function baz() { /* empty */ }

                e.on('foo', foo);
                e.on('bar', bar);
                e.on('bar', baz);

                expect(e.removeListener('foo', bar)).toBe(e);
                expect(e.listeners('bar')).toEqual([bar, baz]);
                expect(e.listeners('foo')).toEqual([foo]);
                expect(e._eventsCount).toBe(2);

                e.removeListener('foo', foo);
                expect(e.listeners('bar')).toEqual([bar, baz]);
                expect(e.listeners('foo')).toEqual([]);
                expect(e._eventsCount).toBe(1);

                e.removeListener('bar', bar);
                expect(e.listeners('bar')).toEqual([baz]);
                expect(e._eventsCount).toBe(1);

                e.removeListener('bar', baz);
                expect(e.listeners('bar')).toEqual([]);
                expect(e._eventsCount).toBe(0);

                e.on('foo', foo);
                e.on('foo', foo);
                e.on('bar', bar);

                e.removeListener('foo', foo);
                expect(e.listeners('bar')).toEqual([bar]);
                expect(e.listeners('foo')).toEqual([]);
                expect(e._eventsCount).toBe(1);
            });

            it('removes only once listeners when the once flag is set', () =>
            {
                const e = new EventEmitter();

                function foo() { /* empty */ }

                e.on('foo', foo);

                e.removeListener('foo', () => { /* empty */ }, undefined, true);
                expect(e.listeners('foo')).toEqual([foo]);

                e.removeListener('foo', foo, undefined, true);
                expect(e.listeners('foo')).toEqual([foo]);

                e.removeListener('foo', foo);
                expect(e.listeners('foo')).toEqual([]);
                expect(e._eventsCount).toBe(0);

                e.once('foo', foo);
                e.on('foo', foo);

                e.removeListener('foo', () => { /* empty */ }, undefined, true);
                expect(e.listeners('foo')).toEqual([foo, foo]);

                e.removeListener('foo', foo, undefined, true);
                expect(e.listeners('foo')).toEqual([foo]);

                e.once('foo', foo);
                e.removeListener('foo', foo);
                expect(e.listeners('foo')).toEqual([]);
                expect(e._eventsCount).toBe(0);
            });

            it('removes only the listeners matching the given context', () =>
            {
                const context = { foo: 'bar' };
                const e = new EventEmitter();

                function foo() { /* empty */ }
                function bar() { /* empty */ }

                e.on('foo', foo, context);

                e.removeListener('foo', () => { /* empty */ }, context);
                expect(e.listeners('foo')).toEqual([foo]);

                e.removeListener('foo', foo, { baz: 'quux' });
                expect(e.listeners('foo')).toEqual([foo]);

                e.removeListener('foo', foo, context);
                expect(e.listeners('foo')).toEqual([]);
                expect(e._eventsCount).toBe(0);

                e.on('foo', foo, context);
                e.on('foo', bar);

                e.removeListener('foo', foo, { baz: 'quux' });
                expect(e.listeners('foo')).toEqual([foo, bar]);

                e.removeListener('foo', foo, context);
                expect(e.listeners('foo')).toEqual([bar]);

                e.on('foo', bar, context);
                e.removeListener('foo', bar);
                expect(e.listeners('foo')).toEqual([]);
                expect(e._eventsCount).toBe(0);
            });
        });

        describe('removeAllListeners', () =>
        {
            const throws = () => { throw new Error('oops'); };

            it('removes the listeners of one event', () =>
            {
                const e = new EventEmitter();

                e.on('foo', throws);
                e.on('foo', throws);
                e.on('bar', throws);
                e.on('aaa', throws);

                expect(e.removeAllListeners('foo')).toBe(e);
                expect(e.listeners('foo').length).toBe(0);
                expect(e.listeners('bar').length).toBe(1);
                expect(e.listeners('aaa').length).toBe(1);
                expect(e._eventsCount).toBe(2);

                e.removeAllListeners('bar');
                expect(e._eventsCount).toBe(1);
                e.removeAllListeners('aaa');
                expect(e._eventsCount).toBe(0);

                expect(e.emit('foo')).toBe(false);
                expect(e.emit('bar')).toBe(false);
                expect(e.emit('aaa')).toBe(false);
            });

            it('removes every listener', () =>
            {
                const e = new EventEmitter();

                e.on('foo', throws);
                e.on('foo', throws);
                e.on('bar', throws);
                e.on('aaa', throws);

                expect(e.removeAllListeners()).toBe(e);
                expect(e.listeners('foo').length).toBe(0);
                expect(e._eventsCount).toBe(0);
                expect(e.emit('foo')).toBe(false);
                expect(e.emit('bar')).toBe(false);
                expect(e.emit('aaa')).toBe(false);
            });
        });

        describe('eventNames', () =>
        {
            it('returns an empty array when there are no events', () =>
            {
                const e = new EventEmitter();

                expect(e.eventNames()).toEqual([]);

                e.on('foo', () => { /* empty */ });
                e.removeAllListeners('foo');
                expect(e.eventNames()).toEqual([]);
            });

            it('lists the events that have listeners', () =>
            {
                const e = new EventEmitter();

                function bar() { /* empty */ }

                e.on('foo', () => { /* empty */ });
                e.on('bar', bar);
                expect(e.eventNames()).toEqual(['foo', 'bar']);

                e.removeListener('bar', bar);
                expect(e.eventNames()).toEqual(['foo']);
            });

            it('includes symbols', () =>
            {
                const e = new EventEmitter();
                const s = Symbol('s');

                function foo() { /* empty */ }

                e.on('foo', foo);
                e.on(s, () => { /* empty */ });
                expect(e.eventNames()).toEqual(['foo', s]);

                e.removeListener('foo', foo);
                expect(e.eventNames()).toEqual([s]);
            });
        });
    });

    describe('changes during an emit', () =>
    {
        it('does not call a listener that an earlier listener removes during the emit', () =>
        {
            const e = new EventEmitter();
            const calls: string[] = [];
            const b = () => calls.push('b');

            e.on('x', () =>
            {
                calls.push('a');
                e.off('x', b);
            });
            e.on('x', b);
            e.emit('x');
            e.emit('x');

            // EventEmitter3 called `b` in the first emit; DOM EventTarget doesn't, nor do we
            expect(calls).toEqual(['a', 'a']);
        });

        it('does not call a listener added during the emit', () =>
        {
            const e = new EventEmitter();
            const calls: string[] = [];

            e.on('x', () =>
            {
                calls.push('a');
                e.on('x', () => calls.push('late'));
            });
            e.on('x', () => calls.push('b'));
            e.emit('x');

            expect(calls).toEqual(['a', 'b']);
            expect(e.listenerCount('x')).toBe(3);
        });

        it('skips a listener removed during an outer emit, in nested emits too', () =>
        {
            const e = new EventEmitter();
            const calls: string[] = [];
            let nested = false;
            const c = () => calls.push('c');

            e.on('x', () =>
            {
                calls.push('a');
                if (nested) return;
                nested = true;
                e.off('x', c);
                e.emit('x');
            });
            e.on('x', () => calls.push('b'));
            e.on('x', c);
            e.emit('x');

            expect(calls).toEqual(['a', 'a', 'b', 'b']);
        });

        it('stops calling listeners once all are removed during the emit', () =>
        {
            const e = new EventEmitter();
            const calls: string[] = [];

            e.on('x', () =>
            {
                calls.push('a');
                e.removeAllListeners('x');
                e.on('x', () => calls.push('new'));
            });
            e.on('x', () => calls.push('b'));
            e.emit('x');
            e.emit('x');

            expect(calls).toEqual(['a', 'new']);
        });

        it('stops calling listeners once every event is cleared during the emit', () =>
        {
            const e = new EventEmitter();
            const calls: string[] = [];

            e.on('x', () =>
            {
                calls.push('a');
                e.removeAllListeners();
            });
            e.on('x', () => calls.push('b'));
            e.emit('x');

            expect(calls).toEqual(['a']);
            expect(e.eventNames()).toEqual([]);
        });

        it('recovers after a listener throws', () =>
        {
            const e = new EventEmitter();
            const b = jest.fn();

            e.on('x', () =>
            {
                e.off('x', b);
                throw new Error('boom');
            });
            e.on('x', b);

            expect(() => e.emit('x')).toThrow('boom');
            expect(e.listenerCount('x')).toBe(1);
            expect(e.listeners('x').length).toBe(1);
        });
    });

    describe('many listeners on one event', () =>
    {
        // past the index threshold, removal goes through the function and context lookups
        const COUNT = 50;

        it('removes a listener by function and context, keeping the order of the rest', () =>
        {
            const e = new EventEmitter();
            const seen: unknown[] = [];
            const contexts = Array.from({ length: COUNT }, (_, i) => ({ i }));

            function shared(this: unknown) { seen.push(this); }

            for (const context of contexts) e.on('x', shared, context);
            for (let i = 0; i < COUNT; i += 2) e.off('x', shared, contexts[i]);

            expect(e.listenerCount('x')).toBe(COUNT / 2);
            e.emit('x');
            expect(seen).toEqual(contexts.filter((_, i) => i % 2 === 1));
        });

        it('removes listeners added without a context by function', () =>
        {
            const e = new EventEmitter();
            const fns = Array.from({ length: COUNT }, () => jest.fn());

            for (const fn of fns) e.on('x', fn);
            for (let i = 0; i < COUNT; i += 2) e.off('x', fns[i]);

            e.emit('x');
            fns.forEach((fn, i) => expect(fn).toHaveBeenCalledTimes(i % 2));
        });

        it('removes a function from every context when no context is given', () =>
        {
            const e = new EventEmitter();
            const shared = jest.fn();
            const other = jest.fn();

            for (let i = 0; i < COUNT; i++) e.on('x', shared, { i });
            e.on('x', shared);
            e.on('x', other);
            e.off('x', shared);

            expect(e.listeners('x')).toEqual([other]);
        });

        it('matches the emitter as the context of a listener added without one', () =>
        {
            const e = new EventEmitter();
            const fns = Array.from({ length: COUNT }, () => jest.fn());

            for (const fn of fns) e.on('x', fn);
            e.off('x', fns[3], e);

            expect(e.listenerCount('x')).toBe(COUNT - 1);
            expect(e.listeners('x')).not.toContain(fns[3]);
        });

        it('respects the once flag', () =>
        {
            const e = new EventEmitter();
            const fn = jest.fn();

            for (let i = 0; i < COUNT; i++)
            {
                if (i % 2) e.once('x', fn);
                else e.on('x', fn);
            }
            e.off('x', fn, undefined, true);

            expect(e.listenerCount('x')).toBe(COUNT / 2);
        });

        it('does not match a context that has no listeners', () =>
        {
            const e = new EventEmitter();
            const fn = jest.fn();

            for (let i = 0; i < COUNT; i++) e.on('x', fn, { i });
            e.off('x', fn, { i: 0 });

            expect(e.listenerCount('x')).toBe(COUNT);
        });

        it('removes once listeners as they fire', () =>
        {
            const e = new EventEmitter();
            const fn = jest.fn();

            for (let i = 0; i < COUNT; i++) e.once('x', fn, { i });
            e.emit('x');
            e.emit('x');

            expect(fn).toHaveBeenCalledTimes(COUNT);
            expect(e.listenerCount('x')).toBe(0);
        });
    });

    describe('_emitUntil', () =>
    {
        it('stops once the check returns true', () =>
        {
            const e = new EventEmitter();
            const event = { stopped: false, calls: [] as string[] };

            e.on('x', (ev: typeof event) => ev.calls.push('a'));
            e.on('x', (ev: typeof event) =>
            {
                ev.calls.push('b');
                ev.stopped = true;
            });
            e.on('x', (ev: typeof event) => ev.calls.push('c'));

            expect(e._emitUntil('x', event, (ev) => ev.stopped)).toBe(true);
            expect(event.calls).toEqual(['a', 'b']);
            expect(e._emitUntil('y', event, (ev) => ev.stopped)).toBe(false);
        });
    });
});
