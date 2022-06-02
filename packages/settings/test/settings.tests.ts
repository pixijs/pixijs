import { settings } from '@pixi/settings';
import { expect } from 'chai';

describe('settings', () =>
{
    it('should have MIPMAP_TEXTURES', () =>
    {
        expect(settings.MIPMAP_TEXTURES).to.be.a('number');
    });

    it('should have RESOLUTION', () =>
    {
        expect(settings.RESOLUTION).to.be.a('number');
    });

    it('should have PREFER_ENV', () =>
    {
        expect(settings.PREFER_ENV).to.be.a('number');
    });

    it('should have FILTER_RESOLUTION', () =>
    {
        expect(settings.FILTER_RESOLUTION).to.be.a('number');
    });

    it('should have SPRITE_MAX_TEXTURES', () =>
    {
        expect(settings.SPRITE_MAX_TEXTURES).to.be.a('number');
    });

    it('should have SPRITE_BATCH_SIZE', () =>
    {
        expect(settings.SPRITE_BATCH_SIZE).to.be.a('number');
    });

    it('should have RENDER_OPTIONS', () =>
    {
        expect(settings.RENDER_OPTIONS).to.be.an('object');
    });

    it('should have GC_MODE', () =>
    {
        expect(settings.GC_MODE).to.be.a('number');
    });

    it('should have GC_MAX_IDLE', () =>
    {
        expect(settings.GC_MAX_IDLE).to.be.a('number');
    });

    it('should have GC_MAX_CHECK_COUNT', () =>
    {
        expect(settings.GC_MAX_CHECK_COUNT).to.be.a('number');
    });

    it('should have WRAP_MODE', () =>
    {
        expect(settings.WRAP_MODE).to.be.a('number');
    });

    it('should have SCALE_MODE', () =>
    {
        expect(settings.SCALE_MODE).to.be.a('number');
    });

    it('should have PRECISION_VERTEX', () =>
    {
        expect(settings.PRECISION_VERTEX).to.be.a.string;
    });

    it('should have PRECISION_FRAGMENT', () =>
    {
        expect(settings.PRECISION_FRAGMENT).to.be.a.string;
    });

    it('should have CAN_UPLOAD_SAME_BUFFER', () =>
    {
        expect(settings.CAN_UPLOAD_SAME_BUFFER).to.be.a('boolean');
    });
});
