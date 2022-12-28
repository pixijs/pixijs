import * as utils from '@pixi/utils';

describe('utils', () =>
{
    describe('uid', () =>
    {
        it('should exist', () =>
        {
            expect(utils.uid).toBeInstanceOf(Function);
        });

        it('should return a number', () =>
        {
            expect(utils.uid()).toBeNumber();
        });
    });

    describe('hex2rgb', () =>
    {
        it('should exist', () =>
        {
            expect(utils.hex2rgb).toBeInstanceOf(Function);
        });

        // it('should properly convert number to rgb array');
    });

    describe('hex2string', () =>
    {
        it('should exist', () =>
        {
            expect(utils.hex2string).toBeInstanceOf(Function);
        });

        const testCases = [
            [0xffffff, '#ffffff'],
            [0xf00000, '#f00000'],
            [0x012345, '#012345'],
            [0x010000, '#010000'],
            [0x00abcd, '#00abcd'],
            [0x00a000, '#00a000'],
            [0x000987, '#000987'],
            [0x000900, '#000900'],
            [0x000012, '#000012'],
            [0x000010, '#000010'],
            [0x00000f, '#00000f'],
            [0x000000, '#000000'],
        ];

        testCases.forEach(([num, result]) =>
        {
            it(`should properly convert number 0x${num.toString(16)} to hex color string #${result}`, () =>
            {
                expect(utils.hex2string(num as number)).toEqual(result);
            });
        });
    });

    describe('rgb2hex', () =>
    {
        it('should exist', () =>
        {
            expect(utils.rgb2hex).toBeInstanceOf(Function);
        });

        it('should calculate correctly', () =>
        {
            expect(utils.rgb2hex([0.3, 0.2, 0.1])).toEqual(0x4c3319);
        });

        // it('should properly convert rgb array to hex color string');
    });

    describe('string2hex', () =>
    {
        it('should handle short-hand hex colors', () =>
        {
            expect(utils.string2hex('fff')).toEqual(0xffffff);
            expect(utils.string2hex('f00')).toEqual(0xff0000);
            expect(utils.string2hex('000')).toEqual(0);
        });

        it('should handle short-hand hex colors with hash', () =>
        {
            expect(utils.string2hex('#fff')).toEqual(0xffffff);
            expect(utils.string2hex('#f00')).toEqual(0xff0000);
            expect(utils.string2hex('#000')).toEqual(0);
        });

        it('should handle color names', () =>
        {
            expect(utils.string2hex('white')).toEqual(0xffffff);
            expect(utils.string2hex('red')).toEqual(0xff0000);
            expect(utils.string2hex('black')).toEqual(0);
        });

        it('should handle hex colors with hash prefix', () =>
        {
            expect(utils.string2hex('#ffffff')).toEqual(0xffffff);
            expect(utils.string2hex('#ff0000')).toEqual(0xff0000);
            expect(utils.string2hex('#000000')).toEqual(0);
        });

        it('should handle hex colors', () =>
        {
            expect(utils.string2hex('ffffff')).toEqual(0xffffff);
            expect(utils.string2hex('ff0000')).toEqual(0xff0000);
            expect(utils.string2hex('000000')).toEqual(0);
        });

        it('should handle hex with hexadecimal prefix', () =>
        {
            expect(utils.string2hex('0xffffff')).toEqual(0xffffff);
            expect(utils.string2hex('0xff0000')).toEqual(0xff0000);
            expect(utils.string2hex('0x000000')).toEqual(0);
        });
    });

    describe('getResolutionOfUrl', () =>
    {
        it('should exist', () =>
        {
            expect(utils.getResolutionOfUrl).toBeInstanceOf(Function);
        });

        // it('should return the correct resolution based on a URL');
    });

    describe('decomposeDataUri', () =>
    {
        it('should exist', () =>
        {
            expect(utils.decomposeDataUri).toBeInstanceOf(Function);
        });

        it('should decompose a data URI', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/png;base64,94Z9RWUN77ZW');

            expect(dataUri).toBeObject();
            expect(dataUri.mediaType).toEqual('image');
            expect(dataUri.subType).toEqual('png');
            expect(dataUri.charset).toBeUndefined();
            expect(dataUri.encoding).toEqual('base64');
            expect(dataUri.data).toEqual('94Z9RWUN77ZW');
        });

        it('should decompose a data URI with charset', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8;base64,PGRpdiB4bWxucz0Pg==');

            expect(dataUri).toBeObject();
            expect(dataUri.mediaType).toEqual('image');
            expect(dataUri.subType).toEqual('svg+xml');
            expect(dataUri.charset).toEqual('utf8');
            expect(dataUri.encoding).toEqual('base64');
            expect(dataUri.data).toEqual('PGRpdiB4bWxucz0Pg==');
        });

        it('should decompose a data URI with charset without encoding', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8,PGRpdiB4bWxucz0Pg==');

            expect(dataUri).toBeObject();
            expect(dataUri.mediaType).toEqual('image');
            expect(dataUri.subType).toEqual('svg+xml');
            expect(dataUri.charset).toEqual('utf8');
            expect(dataUri.encoding).toBeUndefined();
            expect(dataUri.data).toEqual('PGRpdiB4bWxucz0Pg==');
        });

        it('should return undefined for anything else', () =>
        {
            const dataUri = utils.decomposeDataUri('foo');

            expect(dataUri).toBeUndefined();
        });
    });

    describe('sayHello', () =>
    {
        it('should exist', () =>
        {
            expect(utils.sayHello).toBeInstanceOf(Function);
        });
    });

    describe('isWebGLSupported', () =>
    {
        it('should exist', () =>
        {
            expect(utils.isWebGLSupported).toBeInstanceOf(Function);
        });
    });

    describe('sign', () =>
    {
        it('should return 0 for 0', () =>
        {
            expect(utils.sign(0)).toEqual(0);
        });

        it('should return -1 for negative numbers', () =>
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(-Math.random())).toEqual(-1);
            }
        });

        it('should return 1 for positive numbers', () =>
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(Math.random() + 0.000001)).toEqual(1);
            }
        });
    });

    describe('.removeItems', () =>
    {
        it('should exist', () =>
        {
            expect(utils.removeItems).toBeInstanceOf(Function);
        });

        it('should return if the start index is greater than or equal to the length of the array', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, arr.length + 1, 5);
            expect(arr.length).toEqual(10);
        });

        it('should return if the remove count is 0', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 2, 0);
            expect(arr.length).toEqual(10);
        });

        it('should remove the number of elements specified from the array, starting from the start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 3, 4);
            expect(arr).toEqual([1, 2, 3, 8, 9, 10]);
        });

        it('should remove other elements if delete count is > than the number of elements after start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 7, 10);
            expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('EventEmitter', () =>
    {
        it('should exist', () =>
        {
            expect(utils.EventEmitter).toBeInstanceOf(Function);
        });
    });

    describe('isMobile', () =>
    {
        it('should exist', () =>
        {
            expect(utils.isMobile).toBeObject();
        });

        it('should return a boolean for .any', () =>
        {
            expect(utils.isMobile.any).toBeBoolean();
        });
    });

    describe('earcut', () =>
    {
        it('should exist', () =>
        {
            expect(utils.earcut).toBeInstanceOf(Function);
        });
    });

    describe('color2rgba', () =>
    {
        it.concurrent('should throw error for invalid color values', async () =>
        {
            const invalidColorValues = [-1, '', undefined, null, false, true, {}, { foo: 'bar' }];

            invalidColorValues.forEach((value) =>
            {
                expect(() =>
                {
                    // eslint-disable-next-line
                    // @ts-ignore
                    utils.color2rgba(value);
                }).toThrow();
            });
        });

        it.concurrent('should convert color values to rgba', async () =>
        {
            const transparent = [0, 0, 0, 0];
            const red = [1, 0, 0, 1];
            const semiRed = [1, 0, 0, 0.5];

            // [value, expectedRgba]
            const testCases = [
                // Float32Array
                [new Float32Array([255, 0, 0, 0.5]), semiRed],
                [new Float32Array([255, 0, 0]), red],

                // names
                ['transparent', transparent],
                ['red', red],

                // hex
                ['F00', red],
                ['f00', red],
                ['#f00', red],
                ['ff0000', red],
                ['#ff0000', red],
                ['#ff0000', red],
                ['ff000080', semiRed],
                ['#ff000080', semiRed],

                // numbers
                [0xff0000, red],
                [0xff000080, [1, 0, 0, 0.5019607843137255]],
                [0xff0000ff, red],
                [0, [0, 0, 0, 1]],

                // rgb
                [[255, 0, 0], red],
                [[255, 0, 0, 0.5], semiRed],
                [{ r: 255, g: 0, b: 0 }, red],
                [{ r: 255, g: 0, b: 0, a: 0.5 }, semiRed],
                ['rgb(255, 0, 0)', red],
                ['rgba(255, 0, 0, 0.5)', semiRed],
                ['rgba(255, 0, 0, 50%)', semiRed],
                ['rgba(100% 0% 0% / 50%)', semiRed],

                // hsl
                [{ h: 0, s: 100, l: 50 }, red],
                [{ h: 0, s: 100, l: 50, a: 0.5 }, semiRed],
                ['hsl(0, 100%, 50%)', red],
                ['hsla(0, 100%, 50%, 0.5)', semiRed],

                // hsv
                [{ h: 0, s: 100, v: 100 }, red],
                [{ h: 0, s: 100, v: 100, a: 0.5 }, semiRed],

                // cmyk
                [{ c: 0, m: 100, y: 100, k: 0 }, red],
                [{ c: 0, m: 100, y: 100, k: 0, a: 0.5 }, semiRed],
                ['device-cmyk(0% 100% 100% 0%)', red],
                ['device-cmyk(0% 100% 100% 0% / 0.5)', semiRed],
            ];

            testCases.forEach((tc) =>
            {
                const [value, expectedRgba] = tc;

                expect(utils.color2rgba(value)).toEqual(expectedRgba);
            });
        });
    });
});
