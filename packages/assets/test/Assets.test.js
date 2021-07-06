const { Assets, addLoaderPlugins, loadTexture } = require('../');
const { Texture } = require('@pixi/core');
const chai = require('chai');

describe('Asset', function ()
{
    before(() =>
    {
        addLoaderPlugins(loadTexture);
    });

    it('should load assets correctly', async function ()
    {
        const imageUrl = 'https://www.pixijs.com/wp/wp-content/uploads/feature-scenegraph.png';

        const asset  = await Assets.load(imageUrl);

        chai.expect(asset).to.be.instanceof(Texture);
    });

    it('should load assets correctly if there is a key', async function ()
    {
        const imageUrl = 'https://www.pixijs.com/wp/wp-content/uploads/feature-scenegraph.png';

        Assets.texture.add('test', [
            {
                resolution: 1,
                format: 'png',
                src: imageUrl
            }
        ]);

        addLoaderPlugins(loadTexture);

        const asset  = await Assets.load('test');

        chai.expect(asset).to.be.instanceof(Texture);
    });
});
