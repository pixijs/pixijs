import { settings } from '@pixi/settings';
import '@pixi/core';

describe('settings', () =>
{
    it('should have RESOLUTION', () =>
    {
        expect(settings.RESOLUTION).toBeNumber();
    });

    it('should have PREFER_ENV', () =>
    {
        expect(settings.PREFER_ENV).toBeNumber();
    });

    it('should have SPRITE_MAX_TEXTURES', () =>
    {
        expect(settings.SPRITE_MAX_TEXTURES).toBeNumber();
    });

    it('should have SPRITE_BATCH_SIZE', () =>
    {
        expect(settings.SPRITE_BATCH_SIZE).toBeNumber();
    });

    it('should have RENDER_OPTIONS', () =>
    {
        expect(settings.RENDER_OPTIONS).toBeObject();
    });

    it('should have GC_MODE', () =>
    {
        expect(settings.GC_MODE).toBeNumber();
    });

    it('should have GC_MAX_IDLE', () =>
    {
        expect(settings.GC_MAX_IDLE).toBeNumber();
    });

    it('should have GC_MAX_CHECK_COUNT', () =>
    {
        expect(settings.GC_MAX_CHECK_COUNT).toBeNumber();
    });

    it('should have PRECISION_VERTEX', () =>
    {
        expect(settings.PRECISION_VERTEX).toBeString();
    });

    it('should have PRECISION_FRAGMENT', () =>
    {
        expect(settings.PRECISION_FRAGMENT).toBeString();
    });

    it('should have CAN_UPLOAD_SAME_BUFFER', () =>
    {
        expect(settings.CAN_UPLOAD_SAME_BUFFER).toBeBoolean();
    });
});
