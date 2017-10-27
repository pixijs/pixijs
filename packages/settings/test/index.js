const { settings } = require('../');

describe('PIXI.settings', function ()
{
    it('should have MIPMAP_TEXTURES', function ()
    {
        expect(settings.MIPMAP_TEXTURES).to.be.a.boolean;
    });

    it('should have RESOLUTION', function ()
    {
        expect(settings.RESOLUTION).to.be.a.number;
    });

    it('should have PREFER_WEBGL_2', function ()
    {
        expect(settings.PREFER_WEBGL_2).to.be.a.boolean;
    });

    it('should have FILTER_RESOLUTION', function ()
    {
        expect(settings.FILTER_RESOLUTION).to.be.a.number;
    });

    it('should have SPRITE_MAX_TEXTURES', function ()
    {
        expect(settings.SPRITE_MAX_TEXTURES).to.be.a.number;
    });

    it('should have SPRITE_BATCH_SIZE', function ()
    {
        expect(settings.SPRITE_BATCH_SIZE).to.be.a.number;
    });

    it('should have RENDER_OPTIONS', function ()
    {
        expect(settings.RENDER_OPTIONS).to.be.an.object;
    });

    it('should have GC_MODE', function ()
    {
        expect(settings.GC_MODE).to.be.a.number;
    });

    it('should have GC_MAX_IDLE', function ()
    {
        expect(settings.GC_MAX_IDLE).to.be.a.number;
    });

    it('should have GC_MAX_CHECK_COUNT', function ()
    {
        expect(settings.GC_MAX_CHECK_COUNT).to.be.a.number;
    });

    it('should have WRAP_MODE', function ()
    {
        expect(settings.WRAP_MODE).to.be.a.number;
    });

    it('should have SCALE_MODE', function ()
    {
        expect(settings.SCALE_MODE).to.be.a.number;
    });

    it('should have PRECISION_VERTEX', function ()
    {
        expect(settings.PRECISION_VERTEX).to.be.a.string;
    });

    it('should have PRECISION_FRAGMENT', function ()
    {
        expect(settings.PRECISION_FRAGMENT).to.be.a.string;
    });

    it('should have CAN_UPLOAD_SAME_BUFFER', function ()
    {
        expect(settings.CAN_UPLOAD_SAME_BUFFER).to.be.a.number;
    });
});
