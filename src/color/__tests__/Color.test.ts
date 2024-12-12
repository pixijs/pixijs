import { Color } from '../Color';

import type { ColorSource } from '../Color';

describe('Color', () =>
{
    it.concurrent('should throw error for invalid color values', async () =>
    {
        const invalidColorValues: any[] = [
            -1,
            '',
            null,
            false,
            true,
            {},
            { foo: 'bar' },
            '0xfffff',
            '#ff',
            'ff',
            [1, 1],
            new Uint8Array([255, 255]),
            [1, 1, 1, 1, 0],
        ];

        invalidColorValues.forEach((value) =>
        {
            expect(() => new Color(value as any)).toThrow();
        });
    });

    it.concurrent('should not throw error for invalid color values and not alter the original one', async () =>
    {
        const invalidColorValues: any[] = [
            [1, 1, -1, 1],
            [1, 1, 1.1, 1],
            { r: 1, g: 1, b: 1, a: 1.1 },
        ];

        invalidColorValues.forEach((originalValue) =>
        {
            const value = structuredClone(originalValue);

            expect(() => new Color(value)).not.toThrow();

            expect(value).toEqual(originalValue);
        });
    });

    it.concurrent('should expose a default color object', async () =>
    {
        expect(Color.shared.toHexa()).toEqual('#ffffffff');
    });

    it.concurrent('should copy from another color object', async () =>
    {
        const color = new Color('red');
        const color2 = new Color(color);

        expect(color.value).toBe(color2.value);
        expect(color.toArray()).toStrictEqual(color2.toArray());
    });

    it.concurrent('should convert color values to rgba', async () =>
    {
        const transparent = {
            array: [0, 0, 0, 0],
            hex: '#000000',
            hexa: '#00000000',
            number: 0,
            rgb: { r: 0, g: 0, b: 0 },
            rgba: { r: 0, g: 0, b: 0, a: 0 },
            rgbaString: 'rgba(0,0,0,0)',
            uint8RgbArray: [0, 0, 0],
        };

        const black = {
            array: [0, 0, 0, 1],
            hex: '#000000',
            hexa: '#000000ff',
            number: 0,
            rgb: { r: 0, g: 0, b: 0 },
            rgba: { r: 0, g: 0, b: 0, a: 1 },
            rgbaString: 'rgba(0,0,0,1)',
            uint8RgbArray: [0, 0, 0],
        };

        const white = {
            array: [1, 1, 1, 1],
            hex: '#ffffff',
            hexa: '#ffffffff',
            number: 0xffffff,
            rgb: { r: 1, g: 1, b: 1 },
            rgba: { r: 1, g: 1, b: 1, a: 1 },
            rgbaString: 'rgba(255,255,255,1)',
            uint8RgbArray: [255, 255, 255],
        };

        const red = {
            array: [1, 0, 0, 1],
            hex: '#ff0000',
            hexa: '#ff0000ff',
            number: 0xff0000,
            rgb: { r: 1, g: 0, b: 0 },
            rgba: { r: 1, g: 0, b: 0, a: 1 },
            rgbaString: 'rgba(255,0,0,1)',
            uint8RgbArray: [255, 0, 0],
        };

        const semiRed = {
            array: [1, 0, 0, 0.5],
            hex: '#ff0000',
            hexa: '#ff000080',
            number: 0xff0000,
            rgb: { r: 1, g: 0, b: 0 },
            rgba: { r: 1, g: 0, b: 0, a: 0.5 },
            rgbaString: 'rgba(255,0,0,0.5)',
            uint8RgbArray: [255, 0, 0],
        };

        // [value, expectedRgba]
        const testCases: Array<[ColorSource, typeof transparent]> = [
            // Float32Array
            [new Float32Array([0, 0, 0, 0]), transparent],
            [new Float32Array([1, 0, 0, 0.5]), semiRed],
            [new Float32Array([1, 0, 0]), red],
            [new Float32Array([0, 0, 0]), black],
            [new Float32Array([1, 1, 1]), white],
            [new Float32Array([1, 1, 1, 1]), white],

            // Uint8Array
            [new Uint8Array([255, 0, 0]), red],
            [new Uint8Array([0, 0, 0]), black],
            [new Uint8Array([255, 255, 255]), white],
            [new Uint8ClampedArray([255, 0, 0]), red],
            [new Uint8ClampedArray([0, 0, 0]), black],
            [new Uint8ClampedArray([255, 255, 255]), white],

            // names
            ['transparent', transparent],
            ['white', white],
            ['red', red],
            ['black', black],

            // hex
            ['F00', red],
            ['f00', red],
            ['#f00', red],
            ['ff0000', red],
            ['0xff0000', red],
            ['#ff0000', red],
            ['#ff0000', red],
            ['ff000080', semiRed],
            ['#ff000080', semiRed],
            ['0xff000080', semiRed],
            ['#ffffff', white],
            ['#fff', white],
            ['fff', white],
            ['0xfff', white],
            ['#000', black],
            ['#000000', black],
            ['#00000000', transparent],

            // numbers
            [0xff0000, red],
            [0xffffff, white],
            [0, black],

            // rgb
            [[1, 0, 0], red],
            [[0, 0, 0], black],
            [[1, 1, 1], white],
            [[1, 0, 0, 0.5], semiRed],
            [[0, 0, 0, 0], transparent],
            [{ r: 255, g: 0, b: 0 }, red],
            [{ r: 255, g: 0, b: 0, a: 0.5 }, semiRed],
            [{ r: 0, g: 0, b: 0 }, black],
            [{ r: 0, g: 0, b: 0, a: 1 }, black],
            [{ r: 0, g: 0, b: 0, a: 0 }, transparent],
            [{ r: 255, g: 255, b: 255 }, white],
            [{ r: 255, g: 255, b: 255, a: 1 }, white],
            ['rgb(255, 0, 0)', red],
            ['rgba(255, 0, 0, 0.5)', semiRed],
            ['rgba(255, 0, 0, 50%)', semiRed],
            ['rgba(100% 0% 0% / 50%)', semiRed],
            ['rgba(255, 255, 255)', white],
            ['rgba(255, 255, 255, 100%)', white],
            ['rgba(100% 100% 100% / 100%)', white],
            ['rgba(0, 0, 0)', black],
            ['rgba(0, 0, 0, 0)', transparent],
            ['rgba(0% 0% 0% / 0%)', transparent],

            // hsl
            [{ h: 0, s: 100, l: 50 }, red],
            [{ h: 0, s: 100, l: 50, a: 0.5 }, semiRed],
            [{ h: 0, s: 0, l: 0, a: 1 }, black],
            ['hsl(0, 100%, 50%)', red],
            ['hsla(0, 100%, 50%, 0.5)', semiRed],
            ['hsla(0, 0%, 0%, 1)', black],
            ['hsla(0, 0%, 0%, 0)', transparent],

            // hsv
            [{ h: 0, s: 100, v: 100 }, red],
            [{ h: 0, s: 100, v: 100, a: 0.5 }, semiRed],
            [{ h: 0, s: 0, v: 0, a: 1 }, black],
            [{ h: 0, s: 0, v: 0, a: 0 }, transparent],
        ];

        testCases.forEach((tc) =>
        {
            const [value, expected] = tc;
            const color = new Color(value);

            expect(color.toArray()).toEqual(expected.array);
            expect(color.toHex()).toEqual(expected.hex);
            expect(color.toHexa()).toEqual(expected.hexa);
            expect(color.toNumber()).toEqual(expected.number);
            expect(color.toRgb()).toEqual(expected.rgb);
            expect(color.toRgba()).toEqual(expected.rgba);
            expect(color.toRgbaString()).toEqual(expected.rgbaString);
            expect(color.toUint8RgbArray()).toEqual(expected.uint8RgbArray);
        });
    });

    it('should clamp the color results with inputs over 1', () =>
    {
        const color = new Color('rgba(150% 150% 150% / 150%)');

        expect(color.red).toBe(1);
        expect(color.blue).toBe(1);
        expect(color.green).toBe(1);
        expect(color.alpha).toBe(1);
    });

    it('should clamp the color results with multiply', () =>
    {
        const color = new Color(0xffffff).premultiply(2);

        expect(color.red).toBe(1);
        expect(color.blue).toBe(1);
        expect(color.green).toBe(1);
        expect(color.alpha).toBe(1);
    });

    it('should clamp the color when multiplying', () =>
    {
        const worldAlpha = 1.1;
        const color = new Color().setValue(0xffffff)
            .multiply([worldAlpha, worldAlpha, worldAlpha])
            .setAlpha(worldAlpha);

        expect(color.red).toBe(1);
        expect(color.blue).toBe(1);
        expect(color.green).toBe(1);
        expect(color.alpha).toBe(1);
    });

    it('should multiply color correctly', () =>
    {
        const color = new Color([0.5, 0.5, 0.5, 0.5]).multiply([0.5, 0.5, 0.5, 0.5]);

        expect(color.red).toBe(0.25);
        expect(color.blue).toBe(0.25);
        expect(color.green).toBe(0.25);
        expect(color.alpha).toBe(0.25);
        expect(color.toNumber()).toBe(0x3f3f3f);
    });

    it('should invalidate value when multiply', () =>
    {
        const color = new Color(0xff0000);

        expect(color.value).toBe(0xff0000);

        color.multiply(0xcccccc);

        expect(color.value).toBe(null);

        color.setValue(0x999999);

        expect(color.value).toBe(0x999999);
    });

    it('should premultiply color correctly', () =>
    {
        const color = new Color([0.5, 0.5, 0.5, 1]).premultiply(0.5);

        expect(color.red).toBe(0.25);
        expect(color.blue).toBe(0.25);
        expect(color.green).toBe(0.25);
        expect(color.alpha).toBe(0.5);
    });

    it('should premultiply alpha only correctly', () =>
    {
        const color = new Color([0.5, 0.5, 0.5, 1]).premultiply(0.5, false);

        expect(color.red).toBe(0.5);
        expect(color.blue).toBe(0.5);
        expect(color.green).toBe(0.5);
        expect(color.alpha).toBe(0.5);
    });

    it('should output premultiplied alpha integer correctly', () =>
    {
        const color = new Color([0.5, 0.5, 0.5, 1]);

        expect(color.toPremultiplied(0)).toBe(0);
        expect(color.toPremultiplied(0.5)).toBe(0x7f404040);
    });

    it('should support objects that extends Number', () =>
    {
        class ColorNumber extends Number {}

        const color = new Color(new ColorNumber(0xff0000) as number);

        expect(color.toNumber()).toBe(0xff0000);
    });

    it('should set preserve value when original Array mutes', () =>
    {
        const originalValue = [0, 0, 0, 1];
        const color = new Color(originalValue);

        expect(color.red).toBe(0);
        expect(color.value).not.toBe(originalValue);
        expect(color.value).toEqual(originalValue);
        originalValue[0] = 1;
        expect((color.value as number[])[0]).toEqual(0);
        expect(color.red).toBe(0);
        color.setValue(originalValue);
        expect(color.red).toBe(1);
    });

    it('should set preserve value when original typed array mutes', () =>
    {
        const originalValue = new Float32Array([0, 0, 0, 1]);
        const color = new Color(originalValue);

        expect(color.red).toBe(0);
        expect(color.value).not.toBe(originalValue);
        expect(color.value).toEqual(originalValue);
        originalValue[0] = 1;
        expect((color.value as Float32Array)[0]).toBe(0);
        expect(color.red).toBe(0);
        color.setValue(originalValue);
        expect(color.red).toBe(1);
    });

    it('should set preserve value when original object mutes', () =>
    {
        const originalValue = { r: 0, g: 0, b: 0 };
        const color = new Color(originalValue);

        expect(color.red).toBe(0);
        expect(color.value).not.toBe(originalValue);
        expect(color.value).toEqual(originalValue);
        originalValue.r = 255;
        expect((color.value as typeof originalValue).r).toBe(0);
        expect(color.red).toBe(0);
        color.setValue(originalValue);
        expect(color.red).toBe(1);
    });
});
