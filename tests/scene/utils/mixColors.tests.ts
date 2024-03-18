import { mixColors, mixStandardAnd32BitColors } from '../../../src/scene/container/utils/mixColors';

describe('mixColors', () =>
{
    it('should take other color if one of BGR colors is WHITE', async () =>
    {
        const result = mixColors(0xFFFFFF, 0x123456);

        expect(result).toBe(0x123456);
    });

    it('should take average per-component if one of BGR colors is not WHITE', async () =>
    {
        const result = mixColors(0xFEEDDC, 0x123456);

        expect(result).toBe(0x889099);
    });

    it('should take other color if one of RGB+A, BGRA colors is WHITE', async () =>
    {
        const result = mixStandardAnd32BitColors(0xFFFFFF, 0.5, 0x40123456);

        expect(result).toBe(0x20123456);
    });

    it('should take average per-component if one of RGB+A, BGRA colors is not WHITE', async () =>
    {
        const result = mixStandardAnd32BitColors(0xFEEDDC, 0.5, 0x40123456);

        expect(result).toBe(0x207790AA);
    });
});
