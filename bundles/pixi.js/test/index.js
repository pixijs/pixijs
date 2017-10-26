/* eslint-disable global-require */
require('../');

describe('PIXI', function ()
{
    it('should exist as a global object', function ()
    {
        expect(PIXI).to.be.an('object');
    });
});
