import * as utils from '@pixi/utils';

describe('utils', () =>
{
    describe('uid', () =>
    {
        it('should exist', () =>
        {
            expect(utils.uid)
                .toBeInstanceOf(Function);
        });

        it('should return a number', () =>
        {
            expect(utils.uid())
                .to.be.a('number');
        });
    });

    describe('hex2rgb', () =>
    {
        it('should exist', () =>
        {
            expect(utils.hex2rgb)
                .toBeInstanceOf(Function);
        });

        // it('should properly convert number to rgb array');
    });

    describe('hex2string', () =>
    {
        it('should exist', () =>
        {
            expect(utils.hex2string)
                .toBeInstanceOf(Function);
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
                expect(utils.hex2string(num as number)).toEquals(result);
            });
        });
    });

    describe('rgb2hex', () =>
    {
        it('should exist', () =>
        {
            expect(utils.rgb2hex)
                .toBeInstanceOf(Function);
        });

        it('should calculate correctly', () =>
        {
            expect(utils.rgb2hex([0.3, 0.2, 0.1])).toEquals(0x4c3319);
        });

        // it('should properly convert rgb array to hex color string');
    });

    describe('getResolutionOfUrl', () =>
    {
        it('should exist', () =>
        {
            expect(utils.getResolutionOfUrl)
                .toBeInstanceOf(Function);
        });

        // it('should return the correct resolution based on a URL');
    });

    describe('decomposeDataUri', () =>
    {
        it('should exist', () =>
        {
            expect(utils.decomposeDataUri)
                .toBeInstanceOf(Function);
        });

        it('should decompose a data URI', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/png;base64,94Z9RWUN77ZW');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .toEqual('image');
            expect(dataUri.subType)
                .toEqual('png');
            expect(dataUri.charset)
                .to.be.an('undefined');
            expect(dataUri.encoding)
                .toEqual('base64');
            expect(dataUri.data)
                .toEqual('94Z9RWUN77ZW');
        });

        it('should decompose a data URI with charset', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8;base64,PGRpdiB4bWxucz0Pg==');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .toEqual('image');
            expect(dataUri.subType)
                .toEqual('svg+xml');
            expect(dataUri.charset)
                .toEqual('utf8');
            expect(dataUri.encoding)
                .toEqual('base64');
            expect(dataUri.data)
                .toEqual('PGRpdiB4bWxucz0Pg==');
        });

        it('should decompose a data URI with charset without encoding', () =>
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8,PGRpdiB4bWxucz0Pg==');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .toEqual('image');
            expect(dataUri.subType)
                .toEqual('svg+xml');
            expect(dataUri.charset)
                .toEqual('utf8');
            expect(dataUri.encoding)
                .to.be.an('undefined');
            expect(dataUri.data)
                .toEqual('PGRpdiB4bWxucz0Pg==');
        });

        it('should return undefined for anything else', () =>
        {
            const dataUri = utils.decomposeDataUri('foo');

            expect(dataUri)
                .to.be.an('undefined');
        });
    });

    describe('sayHello', () =>
    {
        it('should exist', () =>
        {
            expect(utils.sayHello)
                .toBeInstanceOf(Function);
        });
    });

    describe('isWebGLSupported', () =>
    {
        it('should exist', () =>
        {
            expect(utils.isWebGLSupported)
                .toBeInstanceOf(Function);
        });
    });

    describe('sign', () =>
    {
        it('should return 0 for 0', () =>
        {
            expect(utils.sign(0))
                .to.be.equal(0);
        });

        it('should return -1 for negative numbers', () =>
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(-Math.random()))
                    .to.be.equal(-1);
            }
        });

        it('should return 1 for positive numbers', () =>
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(Math.random() + 0.000001))
                    .to.be.equal(1);
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
            expect(arr).to.deep.equal([1, 2, 3, 8, 9, 10]);
        });

        it('should remove other elements if delete count is > than the number of elements after start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 7, 10);
            expect(arr).to.deep.equal([1, 2, 3, 4, 5, 6, 7]);
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
            expect(utils.isMobile).to.be.an('object');
        });

        it('should return a boolean for .any', () =>
        {
            expect(utils.isMobile.any).to.be.a('boolean');
        });
    });

    describe('earcut', () =>
    {
        it('should exist', () =>
        {
            expect(utils.earcut).toBeInstanceOf(Function);
        });
    });
});
