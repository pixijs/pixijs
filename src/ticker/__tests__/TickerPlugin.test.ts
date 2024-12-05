import { UPDATE_PRIORITY } from '../const';
import { Ticker } from '../Ticker';
import { TickerPlugin } from '~/app';

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

    it('should not start application before calling start method if options.autoStart is false', () =>
        new Promise<void>((done) =>
        {
            const app = {} as App;

            TickerPlugin.init.call(app, { autoStart: false });

            expect(app.ticker).toBeInstanceOf(Ticker);
            expect(app.ticker.started).toBe(false);

            app.start();

            app.ticker.addOnce(() =>
            {
                TickerPlugin.destroy.call(app);
                done();
            });
        }));

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
            expect(_ticker.remove).toHaveBeenCalledWith(app.render, app);

            expect(app._ticker).toEqual(ticker);
            expect(ticker.add).toHaveBeenCalledOnce();
            expect(ticker.add).toHaveBeenCalledWith(app.render, app, UPDATE_PRIORITY.LOW);
        });

        it('should assign ticker if no ticker', () =>
        {
            const ticker = { add: jest.fn() };

            app._ticker = null;
            app.ticker = ticker as unknown as Ticker;

            expect(app._ticker).toEqual(ticker);
            expect(ticker.add).toHaveBeenCalledOnce();
            expect(ticker.add).toHaveBeenCalledWith(app.render, app, UPDATE_PRIORITY.LOW);
        });

        it('should assign null ticker', () =>
        {
            const _ticker = { remove: jest.fn() };

            app._ticker = _ticker as unknown as Ticker;
            app.ticker = null;

            expect(_ticker.remove).toHaveBeenCalledOnce();
            expect(_ticker.remove).toHaveBeenCalledWith(app.render, app);

            expect(app._ticker).toBeNull();
        });
    });
});
