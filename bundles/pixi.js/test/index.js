/* eslint-disable global-require */
const PIXI = require('../');

describe('PIXI', function ()
{
    it('should exist as a global object', function ()
    {
        expect(PIXI).to.not.be.undefined;
        expect(PIXI.interaction).to.not.be.undefined;
        expect(PIXI.settings).to.not.be.undefined;
        expect(PIXI.ticker).to.not.be.undefined;
        expect(PIXI.loaders).to.not.be.undefined;
        expect(PIXI.extract).to.not.be.undefined;
        expect(PIXI.mesh).to.not.be.undefined;
        expect(PIXI.prepare).to.not.be.undefined;
        expect(PIXI.utils).to.not.be.undefined;
    });
});
