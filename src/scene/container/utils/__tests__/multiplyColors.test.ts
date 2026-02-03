import { multiplyColors } from '../multiplyColors';

describe('multiplyColors', () =>
{
    it('should take other color if one of BGR colors is WHITE', async () =>
    {
        const result1 = multiplyColors(0xFFFFFF, 0x123456);

        expect(result1).toBe(0x123456);

        const result2 = multiplyColors(0x123456, 0xFFFFFF);

        expect(result2).toBe(0x123456);
    });

    it('should multiply per-component if one of BGR colors is not WHITE', async () =>
    {
        const result = multiplyColors(0xFEEDDC, 0x123456);

        expect(result).toBe(0x11304a);
    });
});
