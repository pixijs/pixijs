import { Color } from '@pixi/color';

import type { ColorSource } from '@pixi/color';

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
            [1, 1, -1, 1],
            [1, 1, 1.1, 1],
            [1, 1, 1, 1, 0],
        ];

        invalidColorValues.forEach((value) =>
        {
            expect(() => new Color(value as any)).toThrow();
        });
    });

    it('should copy from another color object', () =>
    {
        const color = new Color('red');
        const color2 = new Color(color);

        expect(color.value).toBe(color2.value);
        expect(color.toArray()).toStrictEqual(color2.toArray());
    });

    it.concurrent('should convert color values to rgba', async () =>
    {
        const transparent = {
            rgba: [0, 0, 0, 0],
            hexa: '#00000000',
            hex: '#000000',
            number: 0,
            rgbaString: 'rgba(0,0,0,0)',
        };

        const black = {
            rgba: [0, 0, 0, 1],
            hexa: '#000000ff',
            hex: '#000000',
            number: 0,
            rgbaString: 'rgba(0,0,0,1)',
        };

        const white = {
            rgba: [1, 1, 1, 1],
            hexa: '#ffffffff',
            hex: '#ffffff',
            number: 0xffffff,
            rgbaString: 'rgba(255,255,255,1)',
        };

        const red = {
            rgba: [1, 0, 0, 1],
            hexa: '#ff0000ff',
            hex: '#ff0000',
            number: 0xff0000,
            rgbaString: 'rgba(255,0,0,1)',
        };

        const semiRed = {
            rgba: [1, 0, 0, 0.5],
            hexa: '#ff000080',
            hex: '#ff0000',
            number: 0xff0000,
            rgbaString: 'rgba(255,0,0,0.5)',
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

            expect(color.toArray()).toEqual(expected.rgba);
            expect(color.toNumber()).toEqual(expected.number);
            expect(color.toHex()).toEqual(expected.hex);
            expect(color.toHexa()).toEqual(expected.hexa);
            expect(color.toRgbaString()).toEqual(expected.rgbaString);
        });
    });
});
