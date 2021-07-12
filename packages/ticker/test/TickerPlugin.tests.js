const { TickerPlugin, UPDATE_PRIORITY, Ticker } = require('../');

describe('PIXI.TickerPlugin', function ()
{
    it('should not start application before calling start method if options.autoStart is false', function (done)
    {
        const app = {};

        TickerPlugin.init.call(app, { autoStart: false });

        expect(app.ticker).to.be.instanceof(Ticker);
        expect(app.ticker.started).to.be.false;

        app.start();

        app.ticker.addOnce(() =>
        {
            TickerPlugin.destroy.call(app);
            done();
        });
    });

    describe('set ticker', function ()
    {
        before(function ()
        {
            this.app = {
                render()
                {
                    // do nothing
                },
            };
            TickerPlugin.init.call(this.app);
            /* remove default listener to prevent uncaught exception */
            this.app._ticker.remove(this.app.render, this.app);
        });

        after(function ()
        {
            TickerPlugin.destroy.call(this.app);
        });

        it('should assign ticker object', function ()
        {
            const ticker = { add: sinon.spy() };
            const _ticker = { remove: sinon.spy() };

            this.app._ticker = _ticker;
            this.app.ticker = ticker;

            expect(_ticker.remove).to.be.calledOnce;
            expect(_ticker.remove.args[0][0]).to.be.equal(this.app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(this.app);

            expect(this.app._ticker).to.be.equal(ticker);
            expect(ticker.add).to.be.calledOnce;
            expect(ticker.add.args[0][0]).to.be.equal(this.app.render);
            expect(ticker.add.args[0][1]).to.be.equal(this.app);
            expect(ticker.add.args[0][2]).to.be.equal(UPDATE_PRIORITY.LOW);
        });

        it('should assign ticker if no ticker', function ()
        {
            const ticker = { add: sinon.spy() };

            this.app._ticker = null;
            this.app.ticker = ticker;

            expect(this.app._ticker).to.be.equal(ticker);
            expect(ticker.add).to.be.calledOnce;
            expect(ticker.add.args[0][0]).to.be.equal(this.app.render);
            expect(ticker.add.args[0][1]).to.be.equal(this.app);
            expect(ticker.add.args[0][2]).to.be.equal(UPDATE_PRIORITY.LOW);
        });

        it('should assign null ticker', function ()
        {
            const _ticker = { remove: sinon.spy() };

            this.app._ticker = _ticker;
            this.app.ticker = null;

            expect(_ticker.remove).to.be.calledOnce;
            expect(_ticker.remove.args[0][0]).to.be.equal(this.app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(this.app);

            expect(this.app._ticker).to.be.null;
        });
    });
});
