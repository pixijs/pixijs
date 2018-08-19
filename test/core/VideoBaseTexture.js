'use strict';

const URL1 = 'https://example.org/video.webm';
const URL2 = '/test.mp4?123...';

function cleanCache()
{
    delete PIXI.utils.BaseTextureCache[URL1];
    delete PIXI.utils.BaseTextureCache[URL2];

    delete PIXI.utils.TextureCache[URL1];
    delete PIXI.utils.TextureCache[URL2];
}

describe('PIXI.VideoBaseTexture', function ()
{
    it('should find correct video extension from Url', function ()
    {
        cleanCache();

        const videoBaseTexture = new PIXI.VideoBaseTexture.fromUrl(URL1);

        expect(videoBaseTexture.source.firstChild.type).to.be.equals('video/webm');
    });

    it('should get video extension without being thrown by query string', function ()
    {
        cleanCache();

        const videoBaseTexture = new PIXI.VideoBaseTexture.fromUrl(URL2);

        expect(videoBaseTexture.source.firstChild.type).to.be.equals('video/mp4');
    });
});
