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

        expect(appp.ticker).toBeInstanceOf(Ticker);
        expect(appp.ticker.started).toBe(false);

        appp.start();

        appp.ticker.addOnce(() =>
        {
            TickerPlugin.destroy.call(appp);
            done();
        });
    });

    describe('set ticker', () =>
    {
        beforeAll(() =>
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

        afterAll(() =>
        {
            TickerPlugin.destroy.call(app);
        });

        it('should assign ticker object', () =>
        {
            const ticker = { add: jest.fn() };
            const _ticker = { remove: jest.fn() };

            app._ticker = _ticker as unknown as Ticker;
            app.ticker = ticker as unknown as Ticker;

            expect(_ticker.remove).toHaveBeenCalledOnce();
            expect(_ticker.remove.args[0][0]).to.be.equal(app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(app);

            expect(app._ticker).to.be.equal(ticker);
            expect(ticker.add).toHaveBeenCalledOnce();
            expect(ticker.add.args[0][0]).to.be.equal(app.render);
            expect(ticker.add.args[0][1]).to.be.equal(app);
            expect(ticker.add.args[0][2]).to.be.equal(UPDATE_PRIORITY.LOW);
        });

        it('should assign ticker if no ticker', () =>
        {
            const ticker = { add: jest.fn() };

            app._ticker = null;
            app.ticker = ticker as unknown as Ticker;

            expect(app._ticker).to.be.equal(ticker);
            expect(ticker.add).toHaveBeenCalledOnce();
            expect(ticker.add.args[0][0]).to.be.equal(app.render);
            expect(ticker.add.args[0][1]).to.be.equal(app);
            expect(ticker.add.args[0][2]).to.be.equal(UPDATE_PRIORITY.LOW);
        });

        it('should assign null ticker', () =>
        {
            const _ticker = { remove: jest.fn() };

            app._ticker = _ticker as unknown as Ticker;
            app.ticker = null;

            expect(_ticker.remove).toHaveBeenCalledOnce();
            expect(_ticker.remove.args[0][0]).to.be.equal(app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(app);

            expect(app._ticker).toBeNull();
        });
    });
});
