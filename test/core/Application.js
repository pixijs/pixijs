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
});
