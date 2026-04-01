import { TickerListener } from '../TickerListener';

import type { Ticker, TickerCallback } from '../Ticker';

describe('TickerListener', () =>
{
    // Simple mock ticker
    const mockTicker = { deltaTime: 1 } as Ticker;

    describe('constructor', () =>
    {
        it('should create a listener with defaults', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn);

            expect(listener.priority).toEqual(0);
            expect(listener.next).toBeNull();
            expect(listener.previous).toBeNull();
        });

        it('should create a listener with custom priority', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn, null, 50);

            expect(listener.priority).toEqual(50);
        });
    });

    describe('match', () =>
    {
        it('should match by function reference', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn);

            expect(listener.match(fn)).toBe(true);
        });

        it('should not match a different function', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const listener = new TickerListener(fn1);

            expect(listener.match(fn2)).toBe(false);
        });

        it('should match by function and context', () =>
        {
            const fn = jest.fn();
            const context = { value: 42 };
            const listener = new TickerListener(fn, context);

            expect(listener.match(fn, context)).toBe(true);
            expect(listener.match(fn, { value: 42 })).toBe(false); // different reference
            expect(listener.match(fn, null)).toBe(false);
        });

        it('should handle null context matching', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn, null);

            expect(listener.match(fn, null)).toBe(true);
            expect(listener.match(fn)).toBe(true);
        });
    });

    describe('emit', () =>
    {
        it('should call the listener function', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn);

            listener.emit(mockTicker);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(mockTicker);
        });

        it('should call the function with context', () =>
        {
            const context = { value: 0 };
            const fn = jest.fn(function (this: typeof context)
            {
                this.value = 42;
            }) as TickerCallback<typeof context>;
            const listener = new TickerListener(fn, context);

            listener.emit(mockTicker);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(context.value).toEqual(42);
        });

        it('should return the next listener', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const listener1 = new TickerListener(fn1);
            const listener2 = new TickerListener(fn2);

            listener1.next = listener2;

            const result = listener1.emit(mockTicker);

            expect(result).toBe(listener2);
        });

        it('should return null when no next listener', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn);

            const result = listener.emit(mockTicker);

            expect(result).toBeNull();
        });

        it('should auto-destroy when once is true', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn, null, 0, true);

            listener.emit(mockTicker);

            expect(fn).toHaveBeenCalledTimes(1);

            // After emit, the once listener should self-destruct
            // The function reference should be nulled
            listener.emit(mockTicker);
            expect(fn).toHaveBeenCalledTimes(1); // still 1, not called again
        });
    });

    describe('connect', () =>
    {
        it('should connect to a previous node', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const head = new TickerListener(fn1);
            const listener = new TickerListener(fn2);

            listener.connect(head);

            expect(head.next).toBe(listener);
            expect(listener.previous).toBe(head);
            expect(listener.next).toBeNull();
        });

        it('should insert between two nodes', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const fn3 = jest.fn();
            const head = new TickerListener(fn1);
            const tail = new TickerListener(fn2);
            const middle = new TickerListener(fn3);

            // Connect tail first
            tail.connect(head);
            // Insert middle between head and tail
            middle.connect(head);

            expect(head.next).toBe(middle);
            expect(middle.previous).toBe(head);
            expect(middle.next).toBe(tail);
            expect(tail.previous).toBe(middle);
        });
    });

    describe('destroy', () =>
    {
        it('should disconnect from the chain with hard destroy', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const fn3 = jest.fn();
            const head = new TickerListener(fn1);
            const middle = new TickerListener(fn2);
            const tail = new TickerListener(fn3);

            middle.connect(head);
            tail.connect(middle);

            middle.destroy(true);

            expect(head.next).toBe(tail);
            expect(tail.previous).toBe(head);
            // Hard destroy removes next reference
            expect(middle.next).toBeNull();
            expect(middle.previous).toBeNull();
        });

        it('should do a soft destroy maintaining next reference', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const fn3 = jest.fn();
            const head = new TickerListener(fn1);
            const middle = new TickerListener(fn2);
            const tail = new TickerListener(fn3);

            middle.connect(head);
            tail.connect(middle);

            const redirect = middle.destroy(false);

            expect(redirect).toBe(tail);
            expect(head.next).toBe(tail);
            expect(tail.previous).toBe(head);
            // Soft destroy maintains next reference
            expect(middle.next).toBe(tail);
            expect(middle.previous).toBeNull();
        });

        it('should return the redirect (next) listener', () =>
        {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const head = new TickerListener(fn1);
            const listener = new TickerListener(fn2);

            listener.connect(head);

            const redirect = listener.destroy(true);

            expect(redirect).toBeNull(); // No next after tail
        });

        it('should prevent further emits after destroy', () =>
        {
            const fn = jest.fn();
            const listener = new TickerListener(fn);

            listener.destroy(true);
            listener.emit(mockTicker);

            expect(fn).not.toHaveBeenCalled();
        });
    });
});
