const { resources } = require('../');
const { CubeResource } = resources;

describe('PIXI.resources.CubeResource', function ()
{
    it('should create invalid length resource', function ()
    {
        expect(() =>
        {
            resource = new CubeResource(8, 100, 100);
        }).to.throw(Error, /invalid length/i);
    });
});
