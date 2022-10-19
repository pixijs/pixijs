import { CountLimiter } from '@pixi/prepare';

describe('CountLimiter', () =>
{
    it('should limit to specified number per beginFrame()', () =>
    {
        const limit = new CountLimiter(3);

        limit.beginFrame();
        expect(limit.allowedToUpload()).toBe(true);
        expect(limit.allowedToUpload()).toBe(true);
        expect(limit.allowedToUpload()).toBe(true);
        expect(limit.allowedToUpload()).toBe(false);

        limit.beginFrame();
        expect(limit.allowedToUpload()).toBe(true);
        expect(limit.allowedToUpload()).toBe(true);
        expect(limit.allowedToUpload()).toBe(true);
        expect(limit.allowedToUpload()).toBe(false);
    });
});
