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

    it('should have RENDER_OPTIONS', () =>
    {
        expect(settings.RENDER_OPTIONS).toBeObject();
    });

    it('should have PRECISION_VERTEX', () =>
    {
        expect(settings.PRECISION_VERTEX).toBeString();
    });

    it('should have PRECISION_FRAGMENT', () =>
    {
        expect(settings.PRECISION_FRAGMENT).toBeString();
    });
});
