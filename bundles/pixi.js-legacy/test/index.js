/* eslint-disable global-require */
const PIXI = require('../');

describe('PIXI', function ()
{
    it('should exist as a global object', function ()
    {
        expect(window.PIXI).to.not.be.undefined;
        expect(PIXI).to.not.be.undefined;
        expect(PIXI.interaction).to.not.be.undefined;
        expect(PIXI.settings).to.not.be.undefined;
        expect(PIXI.extract).to.not.be.undefined;
        expect(PIXI.prepare).to.not.be.undefined;
        expect(PIXI.utils).to.not.be.undefined;
    });

    it('should contain deprecations on window, not import', function ()
    {
        expect(PIXI.extras).to.be.undefined;
        expect(window.PIXI.extras).to.not.be.undefined;
    });
});
