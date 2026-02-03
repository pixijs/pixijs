import { setTimeout } from 'timers/promises';
import { UPDATE_PRIORITY } from '../const';
import { Ticker } from '../Ticker';

const { shared, system } = Ticker;

describe('Ticker', () =>
{
    let length: (ticker?: Ticker) => number;

    beforeAll(() =>
    {
        length = (ticker?: Ticker) =>
        {
            ticker = ticker || shared;

            if (!ticker['_head'] || !ticker['_head'].next)
            {
                return 0;
            }

            let listener = ticker['_head'].next;
            let i = 0;

            while (listener)
            {
                listener = listener.next;
                i++;
            }

            return i;
        };
    });

    it('should be available', () =>
    {
        expect(Ticker).toBeInstanceOf(Function);
        expect(shared).toBeInstanceOf(Ticker);
        expect(system).toBeInstanceOf(Ticker);
    });

    it('should create a new ticker and destroy it', () =>
    {
        const ticker = new Ticker();

        ticker.start();

        const listener = jest.fn();

        expect(length(ticker)).toEqual(0);

        ticker.add(listener);

        expect(length(ticker)).toEqual(1);

        ticker.destroy();

        expect(ticker['_head']).toBeNull();
        expect(ticker.started).toBe(false);
        expect(length(ticker)).toEqual(0);
    });

    it('should protect destroying shared ticker', () =>
    {
        const listener = jest.fn();

        shared.add(listener); // needed to autoStart
        shared.destroy();
        expect(shared['_head']).not.toBeNull();
        expect(shared.started).toBe(true);
    });

    it('should protect destroying system ticker', () =>
    {
        const listener = jest.fn();

        system.add(listener); // needed to autoStart
        system.destroy();
        expect(system['_head']).not.toBeNull();
        expect(system.started).toBe(true);
    });

    it('should add and remove listener', () =>
    {
        const listener = jest.fn();
        const len = length();

        shared.add(listener);

        expect(length()).toEqual(len + 1);

        shared.remove(listener);

        expect(length()).toEqual(len);
    });

    it('should update a listener', () =>
    {
        const listener = jest.fn();

        shared.add(listener);
        shared.update();

        expect(listener).toHaveBeenCalledTimes(1);

        shared.remove(listener);
        shared.update();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should update a listener twice and remove once', () =>
    {
        const listener = jest.fn();
        const len = length();

        shared.add(listener).add(listener);
        shared.update();

        expect(listener).toHaveBeenCalledTimes(2);
        expect(length()).toEqual(len + 2);

        shared.remove(listener);
        shared.update();

        expect(listener).toHaveBeenCalledTimes(2);
        expect(length()).toEqual(len);
    });

    it('should count listeners correctly', () =>
    {
        const ticker = new Ticker();

        expect(ticker.count).toEqual(0);

        const listener = jest.fn();

        ticker.add(listener);

        expect(ticker.count).toEqual(1);

        ticker.add(listener);

        expect(ticker.count).toEqual(2);

        ticker.remove(listener);

        expect(ticker.count).toEqual(0);

        ticker.destroy();

        expect(ticker['_head']).toBeNull();
        expect(ticker.started).toBe(false);
        expect(length(ticker)).toEqual(0);
    });

    it('should respect priority order', () =>
    {
        const len = length();
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const listener3 = jest.fn();

        shared.add(listener1, null, UPDATE_PRIORITY.LOW)
            .add(listener3, null, UPDATE_PRIORITY.HIGH)
            .add(listener2, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 3);

        const l3 = listener3.mock.invocationCallOrder[0];
        const l2 = listener2.mock.invocationCallOrder[0];
        const l1 = listener1.mock.invocationCallOrder[0];

        expect(l3).toBeLessThan(l2);
        expect(l2).toBeLessThan(l1);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3);

        expect(length()).toEqual(len);
    });

    it('should auto-remove once listeners', () =>
    {
        const len = length();
        const listener = jest.fn();

        shared.addOnce(listener);

        shared.update();

        expect(listener).toHaveBeenCalledTimes(1);
        expect(length()).toEqual(len);
    });

    it('should call when adding same priority', () =>
    {
        const len = length();
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const listener3 = jest.fn();

        shared.add(listener1)
            .add(listener2)
            .add(listener3);

        shared.update();

        expect(length()).toEqual(len + 3);

        const l3 = listener3.mock.invocationCallOrder[0];
        const l2 = listener2.mock.invocationCallOrder[0];
        const l1 = listener1.mock.invocationCallOrder[0];

        expect(l1).toBeLessThan(l2);
        expect(l2).toBeLessThan(l3);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3);

        expect(length()).toEqual(len);
    });

    // TODO: this test repeatedly fails because of issues with timeouts and rafs
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should remove once listener in a stack', () =>
    {
        const len = length();
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const listener3 = jest.fn();

        shared.add(listener1, null, UPDATE_PRIORITY.HIGH);
        shared.addOnce(listener2, null, UPDATE_PRIORITY.NORMAL);
        shared.add(listener3, null, UPDATE_PRIORITY.LOW);

        shared.update();

        expect(length()).toEqual(len + 2);

        shared.update();

        expect(listener1).toHaveBeenCalledTimes(2);
        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener3).toHaveBeenCalledTimes(2);

        shared.remove(listener1).remove(listener3);

        expect(length()).toEqual(len);
    });

    it('should call inserted item with a lower priority', () =>
    {
        const len = length();
        const lowListener = jest.fn();
        const highListener = jest.fn();
        const mainListener = jest.fn(() =>
        {
            shared.add(highListener, null, UPDATE_PRIORITY.HIGH);
            shared.add(lowListener, null, UPDATE_PRIORITY.LOW);
        });

        shared.add(mainListener, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 3);

        expect(mainListener).toHaveBeenCalledTimes(1);
        expect(lowListener).toHaveBeenCalledTimes(1);
        expect(highListener).not.toHaveBeenCalled();

        shared.remove(mainListener)
            .remove(highListener)
            .remove(lowListener);

        expect(length()).toEqual(len);
    });

    it('should remove emit low-priority item during emit', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener1 = jest.fn(() =>
        {
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 2);

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledTimes(1);

        shared.remove(listener1)
            .remove(listener2);

        expect(length()).toEqual(len);
    });

    it('should remove itself on emit after adding new item', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener1 = jest.fn(() =>
        {
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);
            shared.remove(listener1);

            // listener is removed right away
            expect(length()).toEqual(len + 1);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 1);

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledTimes(1);

        shared.remove(listener2);

        expect(length()).toEqual(len);
    });

    // TODO: this test repeatedly fails because of issues with timeouts and rafs
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should remove itself before, still calling new item', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener1 = jest.fn(() =>
        {
            shared.remove(listener1);
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);

            // listener is removed right away
            expect(length()).toEqual(len + 1);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 1);

        expect(listener2).not.toHaveBeenCalled();
        expect(listener1).toHaveBeenCalledTimes(1);

        shared.update();

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledTimes(1);

        shared.remove(listener2);

        expect(length()).toEqual(len);
    });

    it('should remove items before and after current priority', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener3 = jest.fn();
        const listener4 = jest.fn();

        shared.add(listener2, null, UPDATE_PRIORITY.HIGH);
        shared.add(listener3, null, UPDATE_PRIORITY.LOW);
        shared.add(listener4, null, UPDATE_PRIORITY.LOW);

        const listener1 = jest.fn(() =>
        {
            shared.remove(listener2)
                .remove(listener3);

            // listener is removed right away
            expect(length()).toEqual(len + 2);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 2);

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener3).not.toHaveBeenCalled();
        expect(listener4).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledTimes(1);

        shared.update();

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener3).not.toHaveBeenCalled();
        expect(listener4).toHaveBeenCalledTimes(2);
        expect(listener1).toHaveBeenCalledTimes(2);

        shared.remove(listener1)
            .remove(listener4);

        expect(length()).toEqual(len);
    });

    it('should destroy on listener', () =>
        new Promise<void>((done) =>
        {
            const ticker = new Ticker();
            const listener2 = jest.fn();
            const listener = jest.fn(async () =>
            {
                ticker.destroy();
                await setTimeout(0);
                expect(listener2).not.toHaveBeenCalled();
                expect(listener).toHaveBeenCalledTimes(1);
                done();
            });

            ticker.add(listener);
            ticker.add(listener2, null, UPDATE_PRIORITY.LOW);
            ticker.start();
        }));

    it('should Ticker call destroyed listener "next" pointer after destroy', () =>
        new Promise<void>((done) =>
        {
            const ticker = new Ticker();

            const listener1 = jest.fn();
            const listener2 = jest.fn(() =>
            {
                ticker.remove(listener2);
            });

            const listener3 = jest.fn(() =>
            {
                ticker.stop();

                expect(listener1).toHaveBeenCalledTimes(1);
                expect(listener2).toHaveBeenCalledTimes(1);
                expect(listener3).toHaveBeenCalledTimes(1);
                done();
            });

            ticker.add(listener1, null, UPDATE_PRIORITY.HIGH);
            ticker.add(listener2, null, UPDATE_PRIORITY.HIGH);
            ticker.add(listener3, null, UPDATE_PRIORITY.HIGH);

            ticker.start();
        }));
});
