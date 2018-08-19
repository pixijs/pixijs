'use strict';

const URL = '/test.mp4?123...';

function cleanCache()
{
    delete PIXI.utils.BaseTextureCache[URL];

    delete PIXI.utils.TextureCache[URL];
}

describe('PIXI.VideoBaseTexture', function ()
{
    it('should find correct video extension from Url', function ()
    {
        cleanCache();

        const videoBaseTexture = new PIXI.VideoBaseTexture.fromUrl(URL);

        expect(videoBaseTexture.source.firstChild.type).to.be.equals('video/mp4');
    });
});
