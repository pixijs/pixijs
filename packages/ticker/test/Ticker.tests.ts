import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import sinon from 'sinon';
import { expect } from 'chai';

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
        expect(shared).to.be.an.instanceof(Ticker);
        expect(system).to.be.an.instanceof(Ticker);
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

        expect(listener.calledOnce).toBe(true);

        shared.remove(listener);
        shared.update();

        expect(listener.calledOnce).toBe(true);
    });

    it('should update a listener twice and remove once', () =>
    {
        const listener = jest.fn();
        const len = length();

        shared.add(listener).add(listener);
        shared.update();

        expect(listener.calledTwice).toBe(true);
        expect(length()).toEqual(len + 2);

        shared.remove(listener);
        shared.update();

        expect(listener.calledTwice).toBe(true);
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
        const listener4 = jest.fn();

        shared.add(listener1, null, UPDATE_PRIORITY.LOW)
            .add(listener4, null, UPDATE_PRIORITY.INTERACTION)
            .add(listener3, null, UPDATE_PRIORITY.HIGH)
            .add(listener2, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 4);

        sinon.assert.callOrder(listener4, listener3, listener2, listener1);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3)
            .remove(listener4);

        expect(length()).toEqual(len);
    });

    it('should auto-remove once listeners', () =>
    {
        const len = length();
        const listener = jest.fn();

        shared.addOnce(listener);

        shared.update();

        expect(listener.calledOnce).toBe(true);
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

        sinon.assert.callOrder(listener1, listener2, listener3);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3);

        expect(length()).toEqual(len);
    });

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

        expect(listener1.calledTwice).toBe(true);
        expect(listener2.calledOnce).toBe(true);
        expect(listener3.calledTwice).toBe(true);

        shared.remove(listener1).remove(listener3);

        expect(length()).toEqual(len);
    });

    it('should call inserted item with a lower priority', () =>
    {
        const len = length();
        const lowListener = jest.fn();
        const highListener = jest.fn();
        const mainListener = sinon.spy(() =>
        {
            shared.add(highListener, null, UPDATE_PRIORITY.HIGH);
            shared.add(lowListener, null, UPDATE_PRIORITY.LOW);
        });

        shared.add(mainListener, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 3);

        expect(mainListener.calledOnce).toBe(true);
        expect(lowListener.calledOnce).toBe(true);
        expect(highListener.calledOnce).toBe(false);

        shared.remove(mainListener)
            .remove(highListener)
            .remove(lowListener);

        expect(length()).toEqual(len);
    });

    it('should remove emit low-priority item during emit', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener1 = sinon.spy(() =>
        {
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 2);

        expect(listener2.calledOnce).toBe(true);
        expect(listener1.calledOnce).toBe(true);

        shared.remove(listener1)
            .remove(listener2);

        expect(length()).toEqual(len);
    });

    it('should remove itself on emit after adding new item', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener1 = sinon.spy(() =>
        {
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);
            shared.remove(listener1);

            // listener is removed right away
            expect(length()).toEqual(len + 1);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 1);

        expect(listener2.calledOnce).toBe(true);
        expect(listener1.calledOnce).toBe(true);

        shared.remove(listener2);

        expect(length()).toEqual(len);
    });

    it.skip('should remove itself before, still calling new item', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener1 = sinon.spy(() =>
        {
            shared.remove(listener1);
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);

            // listener is removed right away
            expect(length()).toEqual(len + 1);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 1);

        expect(listener2.called).toBe(false);
        expect(listener1.calledOnce).toBe(true);

        shared.update();

        expect(listener2.calledOnce).toBe(true);
        expect(listener1.calledOnce).toBe(true);

        shared.remove(listener2);

        expect(length()).toEqual(len);
    });

    it.skip('should remove items before and after current priority', () =>
    {
        const len = length();
        const listener2 = jest.fn();
        const listener3 = jest.fn();
        const listener4 = jest.fn();

        shared.add(listener2, null, UPDATE_PRIORITY.HIGH);
        shared.add(listener3, null, UPDATE_PRIORITY.LOW);
        shared.add(listener4, null, UPDATE_PRIORITY.LOW);

        const listener1 = sinon.spy(() =>
        {
            shared.remove(listener2)
                .remove(listener3);

            // listener is removed right away
            expect(length()).toEqual(len + 2);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(length()).toEqual(len + 2);

        expect(listener2.calledOnce).toBe(true);
        expect(listener3.calledOnce).toBe(false);
        expect(listener4.calledOnce).toBe(true);
        expect(listener1.calledOnce).toBe(true);

        shared.update();

        expect(listener2.calledOnce).toBe(true);
        expect(listener3.calledOnce).toBe(false);
        expect(listener4.calledTwice).toBe(true);
        expect(listener1.calledTwice).toBe(true);

        shared.remove(listener1)
            .remove(listener4);

        expect(length()).toEqual(len);
    });

    it('should destroy on listener', (done) =>
    {
        const ticker = new Ticker();
        const listener2 = jest.fn();
        const listener = sinon.spy(() =>
        {
            ticker.destroy();
            setTimeout(() =>
            {
                expect(listener2.called).toBe(false);
                expect(listener.calledOnce).toBe(true);
                done();
            }, 0);
        });

        ticker.add(listener);
        ticker.add(listener2, null, UPDATE_PRIORITY.LOW);
        ticker.start();
    });

    it('should Ticker call destroyed listener "next" pointer after destroy', (done) =>
    {
        const ticker = new Ticker();

        const listener1 = jest.fn();
        const listener2 = sinon.spy(() =>
        {
            ticker.remove(listener2);
        });

        const listener3 = sinon.spy(() =>
        {
            ticker.stop();

            expect(listener1.calledOnce).toBe(true);
            expect(listener2.calledOnce).toBe(true);
            expect(listener3.calledOnce).toBe(true);
            done();
        });

        ticker.add(listener1, null, UPDATE_PRIORITY.HIGH);
        ticker.add(listener2, null, UPDATE_PRIORITY.HIGH);
        ticker.add(listener3, null, UPDATE_PRIORITY.HIGH);

        ticker.start();
    });
});
