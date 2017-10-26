'use strict';

describe('PIXI.Application', function ()
{
    it('should generate application', function (done)
    {
        expect(PIXI.Application).to.be.a.function;
        const app = new PIXI.Application();

        expect(app.stage).to.be.instanceof(PIXI.Container);
        expect(app.ticker).to.be.instanceof(PIXI.ticker.Ticker);
        expect(app.renderer).to.be.ok;

        app.ticker.addOnce(() =>
        {
            app.destroy();
            done();
        });
    });

    it('should remove canvas when destroyed', function (done)
    {
        const app = new PIXI.Application();
        const view = app.view;

        expect(view).to.be.instanceof(HTMLCanvasElement);
        document.body.appendChild(view);

        app.ticker.addOnce(() =>
        {
            expect(document.body.contains(view)).to.be.true;
            app.destroy(true);
            expect(document.body.contains(view)).to.be.false;
            done();
        });
    });

    it('should not start application before calling start method if options.autoStart is false', function (done)
    {
        const app = new PIXI.Application({ autoStart: false });

        expect(app.ticker.started).to.be.false;
        app.start();

        app.ticker.addOnce(() =>
        {
            app.destroy();
            done();
        });
    });
});
