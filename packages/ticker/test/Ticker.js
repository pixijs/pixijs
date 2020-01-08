const { Ticker, UPDATE_PRIORITY } = require('../');
const { shared, system } = Ticker;

describe('PIXI.Ticker', function ()
{
    before(function ()
    {
        this.length = (ticker) =>
        {
            ticker = ticker || shared;

            if (!ticker._head || !ticker._head.next)
            {
                return 0;
            }

            let listener = ticker._head.next;
            let i = 0;

            while (listener)
            {
                listener = listener.next;
                i++;
            }

            return i;
        };
    });

    it('should be available', function ()
    {
        expect(Ticker).to.be.a.function;
        expect(shared).to.be.an.instanceof(Ticker);
        expect(system).to.be.an.instanceof(Ticker);
    });

    it('should create a new ticker and destroy it', function ()
    {
        const ticker = new Ticker();

        ticker.start();

        const listener = sinon.spy();

        expect(this.length(ticker)).to.equal(0);

        ticker.add(listener);

        expect(this.length(ticker)).to.equal(1);

        ticker.destroy();

        expect(ticker._head).to.be.null;
        expect(ticker.started).to.be.false;
        expect(this.length(ticker)).to.equal(0);
    });

    it('should protect destroying shared ticker', function ()
    {
        const listener = sinon.spy();

        shared.add(listener); // needed to autoStart
        shared.destroy();
        expect(shared._head).to.not.be.null;
        expect(shared.started).to.be.true;
    });

    it('should protect destroying system ticker', function ()
    {
        const listener = sinon.spy();

        system.add(listener); // needed to autoStart
        system.destroy();
        expect(system._head).to.not.be.null;
        expect(system.started).to.be.true;
    });

    it('should add and remove listener', function ()
    {
        const listener = sinon.spy();
        const length = this.length();

        shared.add(listener);

        expect(this.length()).to.equal(length + 1);

        shared.remove(listener);

        expect(this.length()).to.equal(length);
    });

    it('should update a listener', function ()
    {
        const listener = sinon.spy();

        shared.add(listener);
        shared.update();

        expect(listener.calledOnce).to.be.true;

        shared.remove(listener);
        shared.update();

        expect(listener.calledOnce).to.be.true;
    });

    it('should update a listener twice and remove once', function ()
    {
        const listener = sinon.spy();
        const length = this.length();

        shared.add(listener).add(listener);
        shared.update();

        expect(listener.calledTwice).to.be.true;
        expect(this.length()).to.equal(length + 2);

        shared.remove(listener);
        shared.update();

        expect(listener.calledTwice).to.be.true;
        expect(this.length()).to.equal(length);
    });

    it('should count listeners correctly', function ()
    {
        const ticker = new Ticker();

        expect(ticker.count).to.equal(0);

        const listener = sinon.spy();

        ticker.add(listener);

        expect(ticker.count).to.equal(1);

        ticker.add(listener);

        expect(ticker.count).to.equal(2);

        ticker.remove(listener);

        expect(ticker.count).to.equal(0);

        ticker.destroy();

        expect(ticker._head).to.be.null;
        expect(ticker.started).to.be.false;
        expect(this.length(ticker)).to.equal(0);
    });

    it('should respect priority order', function ()
    {
        const length = this.length();
        const listener1 = sinon.spy();
        const listener2 = sinon.spy();
        const listener3 = sinon.spy();
        const listener4 = sinon.spy();

        shared.add(listener1, null, UPDATE_PRIORITY.LOW)
            .add(listener4, null, UPDATE_PRIORITY.INTERACTION)
            .add(listener3, null, UPDATE_PRIORITY.HIGH)
            .add(listener2, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(this.length()).to.equal(length + 4);

        sinon.assert.callOrder(listener4, listener3, listener2, listener1);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3)
            .remove(listener4);

        expect(this.length()).to.equal(length);
    });

    it('should auto-remove once listeners', function ()
    {
        const length = this.length();
        const listener = sinon.spy();

        shared.addOnce(listener);

        shared.update();

        expect(listener.calledOnce).to.be.true;
        expect(this.length()).to.equal(length);
    });

    it('should call when adding same priority', function ()
    {
        const length = this.length();
        const listener1 = sinon.spy();
        const listener2 = sinon.spy();
        const listener3 = sinon.spy();

        shared.add(listener1)
            .add(listener2)
            .add(listener3);

        shared.update();

        expect(this.length()).to.equal(length + 3);

        sinon.assert.callOrder(listener1, listener2, listener3);

        shared.remove(listener1)
            .remove(listener2)
            .remove(listener3);

        expect(this.length()).to.equal(length);
    });

    it.skip('should remove once listener in a stack', function ()
    {
        const length = this.length();
        const listener1 = sinon.spy();
        const listener2 = sinon.spy();
        const listener3 = sinon.spy();

        shared.add(listener1, null, UPDATE_PRIORITY.HIGH);
        shared.addOnce(listener2, null, UPDATE_PRIORITY.NORMAL);
        shared.add(listener3, null, UPDATE_PRIORITY.LOW);

        shared.update();

        expect(this.length()).to.equal(length + 2);

        shared.update();

        expect(listener1.calledTwice).to.be.true;
        expect(listener2.calledOnce).to.be.true;
        expect(listener3.calledTwice).to.be.true;

        shared.remove(listener1).remove(listener3);

        expect(this.length()).to.equal(length);
    });

    it('should call inserted item with a lower priority', function ()
    {
        const length = this.length();
        const lowListener = sinon.spy();
        const highListener = sinon.spy();
        const mainListener = sinon.spy(() =>
        {
            shared.add(highListener, null, UPDATE_PRIORITY.HIGH);
            shared.add(lowListener, null, UPDATE_PRIORITY.LOW);
        });

        shared.add(mainListener, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(this.length()).to.equal(length + 3);

        expect(mainListener.calledOnce).to.be.true;
        expect(lowListener.calledOnce).to.be.true;
        expect(highListener.calledOnce).to.be.false;

        shared.remove(mainListener)
            .remove(highListener)
            .remove(lowListener);

        expect(this.length()).to.equal(length);
    });

    it('should remove emit low-priority item during emit', function ()
    {
        const length = this.length();
        const listener2 = sinon.spy();
        const listener1 = sinon.spy(() =>
        {
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(this.length()).to.equal(length + 2);

        expect(listener2.calledOnce).to.be.true;
        expect(listener1.calledOnce).to.be.true;

        shared.remove(listener1)
            .remove(listener2);

        expect(this.length()).to.equal(length);
    });

    it('should remove itself on emit after adding new item', function ()
    {
        const length = this.length();
        const listener2 = sinon.spy();
        const listener1 = sinon.spy(() =>
        {
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);
            shared.remove(listener1);

            // listener is removed right away
            expect(this.length()).to.equal(length + 1);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(this.length()).to.equal(length + 1);

        expect(listener2.calledOnce).to.be.true;
        expect(listener1.calledOnce).to.be.true;

        shared.remove(listener2);

        expect(this.length()).to.equal(length);
    });

    it.skip('should remove itself before, still calling new item', function ()
    {
        const length = this.length();
        const listener2 = sinon.spy();
        const listener1 = sinon.spy(() =>
        {
            shared.remove(listener1);
            shared.add(listener2, null, UPDATE_PRIORITY.LOW);

            // listener is removed right away
            expect(this.length()).to.equal(length + 1);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(this.length()).to.equal(length + 1);

        expect(listener2.called).to.be.false;
        expect(listener1.calledOnce).to.be.true;

        shared.update();

        expect(listener2.calledOnce).to.be.true;
        expect(listener1.calledOnce).to.be.true;

        shared.remove(listener2);

        expect(this.length()).to.equal(length);
    });

    it.skip('should remove items before and after current priority', function ()
    {
        const length = this.length();
        const listener2 = sinon.spy();
        const listener3 = sinon.spy();
        const listener4 = sinon.spy();

        shared.add(listener2, null, UPDATE_PRIORITY.HIGH);
        shared.add(listener3, null, UPDATE_PRIORITY.LOW);
        shared.add(listener4, null, UPDATE_PRIORITY.LOW);

        const listener1 = sinon.spy(() =>
        {
            shared.remove(listener2)
                .remove(listener3);

            // listener is removed right away
            expect(this.length()).to.equal(length + 2);
        });

        shared.add(listener1, null, UPDATE_PRIORITY.NORMAL);

        shared.update();

        expect(this.length()).to.equal(length + 2);

        expect(listener2.calledOnce).to.be.true;
        expect(listener3.calledOnce).to.be.false;
        expect(listener4.calledOnce).to.be.true;
        expect(listener1.calledOnce).to.be.true;

        shared.update();

        expect(listener2.calledOnce).to.be.true;
        expect(listener3.calledOnce).to.be.false;
        expect(listener4.calledTwice).to.be.true;
        expect(listener1.calledTwice).to.be.true;

        shared.remove(listener1)
            .remove(listener4);

        expect(this.length()).to.equal(length);
    });

    it('should destroy on listener', function (done)
    {
        const ticker = new Ticker();
        const listener2 = sinon.spy();
        const listener = sinon.spy(() =>
        {
            ticker.destroy();
            setTimeout(() =>
            {
                expect(listener2.called).to.be.false;
                expect(listener.calledOnce).to.be.true;
                done();
            }, 0);
        });

        ticker.add(listener);
        ticker.add(listener2, null, UPDATE_PRIORITY.LOW);
        ticker.start();
    });

    it('should Ticker call destroyed listener "next" pointer after destroy', function (done)
    {
        const ticker = new Ticker();

        const listener1 = sinon.spy();
        const listener2 = sinon.spy(() =>
        {
            ticker.remove(listener2);
        });

        const listener3 = sinon.spy(() =>
        {
            ticker.stop();

            expect(listener1.calledOnce).to.be.true;
            expect(listener2.calledOnce).to.be.true;
            expect(listener3.calledOnce).to.be.true;
            done();
        });

        ticker.add(listener1, null, UPDATE_PRIORITY.HIGH);
        ticker.add(listener2, null, UPDATE_PRIORITY.HIGH);
        ticker.add(listener3, null, UPDATE_PRIORITY.HIGH);

        ticker.start();
    });
});
