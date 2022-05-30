import { Ticker, TickerPlugin, UPDATE_PRIORITY } from '@pixi/ticker';
import { expect } from 'chai';
import sinon from 'sinon';

describe('TickerPlugin', () =>
{
    interface App
    {
        _ticker?: Ticker;
        ticker?: Ticker;
        render?(): void;
        start?(): void;
    }
    let app: App;

    it('should not start application before calling start method if options.autoStart is false', (done) =>
    {
        const appp = {} as App;

        TickerPlugin.init.call(appp, { autoStart: false });

        expect(appp.ticker).to.be.instanceof(Ticker);
        expect(appp.ticker.started).to.be.false;

        appp.start();

        appp.ticker.addOnce(() =>
        {
            TickerPlugin.destroy.call(appp);
            done();
        });
    });

    describe('set ticker', () =>
    {
        before(() =>
        {
            app = {
                render()
                {
                    // do nothing
                },
            };
            TickerPlugin.init.call(app);
            /* remove default listener to prevent uncaught exception */
            app._ticker.remove(app.render, app);
        });

        after(() =>
        {
            TickerPlugin.destroy.call(app);
        });

        it('should assign ticker object', () =>
        {
            const ticker = { add: sinon.spy() };
            const _ticker = { remove: sinon.spy() };

            app._ticker = _ticker as unknown as Ticker;
            app.ticker = ticker as unknown as Ticker;

            expect(_ticker.remove).to.be.calledOnce;
            expect(_ticker.remove.args[0][0]).to.be.equal(app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(app);

            expect(app._ticker).to.be.equal(ticker);
            expect(ticker.add).to.be.calledOnce;
            expect(ticker.add.args[0][0]).to.be.equal(app.render);
            expect(ticker.add.args[0][1]).to.be.equal(app);
            expect(ticker.add.args[0][2]).to.be.equal(UPDATE_PRIORITY.LOW);
        });

        it('should assign ticker if no ticker', () =>
        {
            const ticker = { add: sinon.spy() };

            app._ticker = null;
            app.ticker = ticker as unknown as Ticker;

            expect(app._ticker).to.be.equal(ticker);
            expect(ticker.add).to.be.calledOnce;
            expect(ticker.add.args[0][0]).to.be.equal(app.render);
            expect(ticker.add.args[0][1]).to.be.equal(app);
            expect(ticker.add.args[0][2]).to.be.equal(UPDATE_PRIORITY.LOW);
        });

        it('should assign null ticker', () =>
        {
            const _ticker = { remove: sinon.spy() };

            app._ticker = _ticker as unknown as Ticker;
            app.ticker = null;

            expect(_ticker.remove).to.be.calledOnce;
            expect(_ticker.remove.args[0][0]).to.be.equal(app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(app);

            expect(app._ticker).to.be.null;
        });
    });
});
