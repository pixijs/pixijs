'use strict';

const Ticker = PIXI.ticker.Ticker;
const shared = PIXI.ticker.shared;

describe('PIXI.ticker.Ticker', function ()
{
    it('should be available', function ()
    {
        expect(Ticker).to.be.a.function;
        expect(shared).to.be.an.instanceof(Ticker);
    });

    it('should add and remove listener', function ()
    {
        const listener = sinon.spy();

        shared.add(listener);
        shared.update();
        expect(listener.calledOnce).to.be.true;
        shared.remove(listener);
        shared.update();
        expect(listener.calledOnce).to.be.true;
    });

    it('should respect priority order', function ()
    {
        const listenerCount = shared._listeners.length;
        const listener1 = sinon.spy();
        const listener2 = sinon.spy();
        const listener3 = sinon.spy();
        const listener4 = sinon.spy();

        shared.add(listener1, null, PIXI.UPDATE_PRIORITY.LOW)
            .add(listener4, null, PIXI.UPDATE_PRIORITY.INTERACTION)
            .add(listener3, null, PIXI.UPDATE_PRIORITY.HIGH)
            .add(listener2, null, PIXI.UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(shared._listeners.length).to.equal(listenerCount + 4);

        sinon.assert.callOrder(listener4, listener3, listener2, listener1);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3)
            .remove(listener4);

        expect(shared._listeners.length).to.equal(listenerCount);
    });

    it('should auto-remove once listeners', function ()
    {
        const listenerCount = shared._listeners.length;
        const listener = sinon.spy();

        shared.addOnce(listener);

        shared.update();

        expect(listener.calledOnce).to.be.true;
        expect(shared._listeners.length).to.equal(listenerCount);
    });
});
