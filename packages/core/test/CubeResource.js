const { resources } = require('../');
const { CubeResource } = resources;

describe('PIXI.resources.CubeResource', function ()
{
    it('should create invalid length resource', function ()
    {
        expect(() =>
        {
            // eslint-disable-next-line no-new
            new CubeResource(8);
        }).to.throw(Error, /invalid length/i);
    });
});
