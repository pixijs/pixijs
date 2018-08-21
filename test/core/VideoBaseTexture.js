'use strict';

describe('PIXI.VideoBaseTexture', function ()
{
    afterEach(function ()
    {
        this.texture.destroy();
        this.texture = null;
    });

    it('should find correct video extension from Url', function ()
    {
        this.texture = PIXI.VideoBaseTexture.fromUrl('https://example.org/video.webm');

        expect(this.texture.source.firstChild.type).to.be.equals('video/webm');

        this.texture.destroy();
    });

    it('should get video extension without being thrown by query string', function ()
    {
        this.texture = PIXI.VideoBaseTexture.fromUrl('/test.mp4?123...');

        expect(this.texture.source.firstChild.type).to.be.equals('video/mp4');

        this.texture.destroy();
    });
});
