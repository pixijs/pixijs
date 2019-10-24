const lib = require('../');

describe('PIXI', function ()
{
    it('should have ENV', function ()
    {
        expect(lib.ENV).to.be.object;
    });

    it('should have RENDERER_TYPE', function ()
    {
        expect(lib.RENDERER_TYPE).to.be.object;
    });

    it('should have BLEND_MODES', function ()
    {
        expect(lib.RENDERER_TYPE).to.be.object;
    });

    it('should have DRAW_MODES', function ()
    {
        expect(lib.DRAW_MODES).to.be.object;
    });

    it('should have FORMATS', function ()
    {
        expect(lib.FORMATS).to.be.object;
    });

    it('should have TARGETS', function ()
    {
        expect(lib.TARGETS).to.be.object;
    });

    it('should have TYPES', function ()
    {
        expect(lib.TYPES).to.be.object;
    });

    it('should have SCALE_MODES', function ()
    {
        expect(lib.SCALE_MODES).to.be.object;
    });

    it('should have WRAP_MODES', function ()
    {
        expect(lib.WRAP_MODES).to.be.object;
    });

    it('should have MIPMAP_MODES', function ()
    {
        expect(lib.MIPMAP_MODES).to.be.object;
    });

    it('should have ALPHA_MODES', function ()
    {
        expect(lib.ALPHA_MODES).to.be.object;
    });

    it('should have GC_MODES', function ()
    {
        expect(lib.GC_MODES).to.be.object;
    });

    it('should have PRECISION', function ()
    {
        expect(lib.PRECISION).to.be.object;
    });
});
