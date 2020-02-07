const { TimeLimiter } = require('../');

describe('PIXI.TimeLimiter', function ()
{
    it('should limit to stop after time from beginFrame()', function (done)
    {
        this.slow(500);

        const limit = new TimeLimiter(100);

        limit.beginFrame();
        for (let i = 0; i < 20; ++i)
        {
            expect(limit.allowedToUpload()).to.be.true;
        }

        setTimeout(function ()
        {
            expect(limit.allowedToUpload()).to.be.false;

            limit.beginFrame();

            expect(limit.allowedToUpload()).to.be.true;

            done();
        }, 200);
    });
});
