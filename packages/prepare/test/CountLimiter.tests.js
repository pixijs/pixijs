const { CountLimiter } = require('../');

describe('PIXI.CountLimiter', function ()
{
    it('should limit to specified number per beginFrame()', function ()
    {
        const limit = new CountLimiter(3);

        limit.beginFrame();
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.false;

        limit.beginFrame();
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.false;
    });
});
