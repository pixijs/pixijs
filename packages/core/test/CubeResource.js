const { resources, BaseTexture } = require('../');
const { CubeResource } = resources;
const path = require('path');

describe('PIXI.resources.CubeResource', function ()
{
    before(function ()
    {
        this.baseTexUrl = path.resolve(__dirname, 'resources', 'slug.png');
    });

    it('should create invalid length resource', function ()
    {
        expect(() =>
        {
            // eslint-disable-next-line no-new
            new CubeResource(8);
        }).to.throw(Error, /invalid length/i);
    });
    it('should be created through BaseTexture.from()', function ()
    {
        const path1 = this.baseTexUrl;
        const baseTex = BaseTexture.from([path1, path1, path1, path1, path1, path1]);

        expect(baseTex.resource).to.be.instanceof(CubeResource);
    });
});
