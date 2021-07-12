const utils = require('../');

describe('PIXI.utils', function ()
{
    describe('uid', function ()
    {
        it('should exist', function ()
        {
            expect(utils.uid)
                .to.be.a('function');
        });

        it('should return a number', function ()
        {
            expect(utils.uid())
                .to.be.a('number');
        });
    });

    describe('hex2rgb', function ()
    {
        it('should exist', function ()
        {
            expect(utils.hex2rgb)
                .to.be.a('function');
        });

        // it('should properly convert number to rgb array');
    });

    describe('hex2string', function ()
    {
        it('should exist', function ()
        {
            expect(utils.hex2string)
                .to.be.a('function');
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
                expect(utils.hex2string(num)).to.equals(result);
            });
        });
    });

    describe('rgb2hex', function ()
    {
        it('should exist', function ()
        {
            expect(utils.rgb2hex)
                .to.be.a('function');
        });

        it('should calculate correctly', function ()
        {
            expect(utils.rgb2hex([0.3, 0.2, 0.1])).to.equals(0x4c3319);
        });

        // it('should properly convert rgb array to hex color string');
    });

    describe('getResolutionOfUrl', function ()
    {
        it('should exist', function ()
        {
            expect(utils.getResolutionOfUrl)
                .to.be.a('function');
        });

        // it('should return the correct resolution based on a URL');
    });

    describe('decomposeDataUri', function ()
    {
        it('should exist', function ()
        {
            expect(utils.decomposeDataUri)
                .to.be.a('function');
        });

        it('should decompose a data URI', function ()
        {
            const dataUri = utils.decomposeDataUri('data:image/png;base64,94Z9RWUN77ZW');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .to.equal('image');
            expect(dataUri.subType)
                .to.equal('png');
            expect(dataUri.charset)
                .to.be.an('undefined');
            expect(dataUri.encoding)
                .to.equal('base64');
            expect(dataUri.data)
                .to.equal('94Z9RWUN77ZW');
        });

        it('should decompose a data URI with charset', function ()
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8;base64,PGRpdiB4bWxucz0Pg==');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .to.equal('image');
            expect(dataUri.subType)
                .to.equal('svg+xml');
            expect(dataUri.charset)
                .to.equal('utf8');
            expect(dataUri.encoding)
                .to.equal('base64');
            expect(dataUri.data)
                .to.equal('PGRpdiB4bWxucz0Pg==');
        });

        it('should decompose a data URI with charset without encoding', function ()
        {
            const dataUri = utils.decomposeDataUri('data:image/svg+xml;charset=utf8,PGRpdiB4bWxucz0Pg==');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .to.equal('image');
            expect(dataUri.subType)
                .to.equal('svg+xml');
            expect(dataUri.charset)
                .to.equal('utf8');
            expect(dataUri.encoding)
                .to.be.an('undefined');
            expect(dataUri.data)
                .to.equal('PGRpdiB4bWxucz0Pg==');
        });

        it('should return undefined for anything else', function ()
        {
            const dataUri = utils.decomposeDataUri('foo');

            expect(dataUri)
                .to.be.an('undefined');
        });
    });

    describe('sayHello', function ()
    {
        it('should exist', function ()
        {
            expect(utils.sayHello)
                .to.be.a('function');
        });
    });

    describe('isWebGLSupported', function ()
    {
        it('should exist', function ()
        {
            expect(utils.isWebGLSupported)
                .to.be.a('function');
        });
    });

    describe('sign', function ()
    {
        it('should return 0 for 0', function ()
        {
            expect(utils.sign(0))
                .to.be.equal(0);
        });

        it('should return -1 for negative numbers', function ()
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(-Math.random()))
                    .to.be.equal(-1);
            }
        });

        it('should return 1 for positive numbers', function ()
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(utils.sign(Math.random() + 0.000001))
                    .to.be.equal(1);
            }
        });
    });

    describe('.removeItems', function ()
    {
        it('should exist', function ()
        {
            expect(utils.removeItems).to.be.a('function');
        });

        it('should return if the start index is greater than or equal to the length of the array', function ()
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, arr.length + 1, 5);
            expect(arr.length).to.equal(10);
        });

        it('should return if the remove count is 0', function ()
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 2, 0);
            expect(arr.length).to.equal(10);
        });

        it('should remove the number of elements specified from the array, starting from the start index', function ()
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 3, 4);
            expect(arr).to.deep.equal([1, 2, 3, 8, 9, 10]);
        });

        it('should remove other elements if delete count is > than the number of elements after start index', function ()
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            utils.removeItems(arr, 7, 10);
            expect(arr).to.deep.equal([1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('EventEmitter', function ()
    {
        it('should exist', function ()
        {
            expect(utils.EventEmitter).to.be.a('function');
        });
    });

    describe('isMobile', function ()
    {
        it('should exist', function ()
        {
            expect(utils.isMobile).to.be.an('object');
        });

        it('should return a boolean for .any', function ()
        {
            expect(utils.isMobile.any).to.be.a('boolean');
        });
    });

    describe('earcut', function ()
    {
        it('should exist', function ()
        {
            expect(utils.earcut).to.be.a('function');
        });
    });
});
