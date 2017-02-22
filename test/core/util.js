'use strict';

describe('PIXI.utils', function ()
{
    describe('uid', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.uid)
                .to.be.a('function');
        });

        it('should return a number', function ()
        {
            expect(PIXI.utils.uid())
                .to.be.a('number');
        });
    });

    describe('hex2rgb', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.hex2rgb)
                .to.be.a('function');
        });

        // it('should properly convert number to rgb array');
    });

    describe('hex2string', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.hex2string)
                .to.be.a('function');
        });

        // it('should properly convert number to hex color string');
    });

    describe('rgb2hex', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.rgb2hex)
                .to.be.a('function');
        });

        it('should calculate correctly', function ()
        {
            expect(PIXI.utils.rgb2hex([0.3, 0.2, 0.1])).to.equals(0x4c3319);
        });

        // it('should properly convert rgb array to hex color string');
    });

    describe('getResolutionOfUrl', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.getResolutionOfUrl)
                .to.be.a('function');
        });

        // it('should return the correct resolution based on a URL');
    });

    describe('decomposeDataUri', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.decomposeDataUri)
                .to.be.a('function');
        });

        it('should decompose a data URI', function ()
        {
            const dataUri = PIXI.utils.decomposeDataUri('data:image/png;base64,94Z9RWUN77ZW');

            expect(dataUri)
                .to.be.an('object');
            expect(dataUri.mediaType)
                .to.equal('image');
            expect(dataUri.subType)
                .to.equal('png');
            expect(dataUri.encoding)
                .to.equal('base64');
            expect(dataUri.data)
                .to.equal('94Z9RWUN77ZW');
        });

        it('should return undefined for anything else', function ()
        {
            const dataUri = PIXI.utils.decomposeDataUri('foo');

            expect(dataUri)
                .to.be.an('undefined');
        });
    });

    describe('getUrlFileExtension', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.getUrlFileExtension)
                .to.be.a('function');
        });

        it('should return extension of URL in lower case', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('http://foo.bar/baz.PNG');

            expect(imageType)
                .to.equal('png');
        });

        it('should return extension of URL when absolute', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('/you/baz.PNG');

            expect(imageType)
                .to.equal('png');
        });

        it('should return extension of URL when relative', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('me/baz.PNG');

            expect(imageType)
                .to.equal('png');
        });

        it('should return extension of URL when just an extension', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('.PNG');

            expect(imageType)
                .to.equal('png');
        });

        it('should work with a hash on the url', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('http://foo.bar/baz.PNG#derp');

            expect(imageType)
                .to.equal('png');
        });

        it('should work with a hash path on the url', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('http://foo.bar/baz.PNG#derp/this/is/a/path/me.jpg');

            expect(imageType)
                .to.equal('png');
        });

        it('should work with a query string on the url', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('http://foo.bar/baz.PNG?v=1&file=me.jpg');

            expect(imageType)
                .to.equal('png');
        });

        it('should work with a hash and query string on the url', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('http://foo.bar/baz.PNG?v=1&file=me.jpg#not-today');

            expect(imageType)
                .to.equal('png');
        });

        it('should work with a hash path and query string on the url', function ()
        {
            const imageType = PIXI.utils.getUrlFileExtension('http://foo.bar/baz.PNG?v=1&file=me.jpg#path/s/not-today.svg');

            expect(imageType)
                .to.equal('png');
        });
    });

    describe('getSvgSize', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.getSvgSize)
                .to.be.a('function');
        });

        it('should return a size object with width and height from an SVG string', function ()
        {
            const svgSize = PIXI.utils.getSvgSize('<svg height="32" width="64"></svg>');

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should return a size object from an SVG string with inverted quotes', function ()
        {
            var svgSize = PIXI.utils.getSvgSize("<svg height='32' width='64'></svg>"); // eslint-disable-line quotes

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should work with px values', function ()
        {
            const svgSize = PIXI.utils.getSvgSize('<svg height="32px" width="64px"></svg>');

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should return an empty object when width and/or height is missing', function ()
        {
            const svgSize = PIXI.utils.getSvgSize('<svg width="64"></svg>');

            expect(Object.keys(svgSize).length)
                .to.equal(0);
        });
    });

    describe('sayHello', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.sayHello)
                .to.be.a('function');
        });
    });

    describe('isWebGLSupported', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.isWebGLSupported)
                .to.be.a('function');
        });
    });

    describe('sign', function ()
    {
        it('should return 0 for 0', function ()
        {
            expect(PIXI.utils.sign(0))
                .to.be.equal(0);
        });

        it('should return -1 for negative numbers', function ()
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(PIXI.utils.sign(-Math.random()))
                    .to.be.equal(-1);
            }
        });

        it('should return 1 for positive numbers', function ()
        {
            for (let i = 0; i < 10; i += 1)
            {
                expect(PIXI.utils.sign(Math.random() + 0.000001))
                    .to.be.equal(1);
            }
        });
    });

    describe('.removeItems', function ()
    {
        var arr;

        beforeEach(() =>
        {
            arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        });

        it('should return if the start index is greater than or equal to the length of the array', function ()
        {
            PIXI.utils.removeItems(arr, arr.length + 1, 5);
            expect(arr.length).to.be.equal(10);
        });

        it('should return if the remove count is 0', function ()
        {
            PIXI.utils.removeItems(arr, 2, 0);
            expect(arr.length).to.be.equal(10);
        });

        it('should remove the number of elements specified from the array, starting from the start index', function ()
        {
            const res = [1, 2, 3, 8, 9, 10];

            PIXI.utils.removeItems(arr, 3, 4);
            expect(arr).to.be.deep.equal(res);
        });

        it('should remove other elements if delete count is > than the number of elements after start index', function ()
        {
            const res = [1, 2, 3, 4, 5, 6, 7];

            PIXI.utils.removeItems(arr, 7, 10);
            expect(arr).to.be.deep.equal(res);
        });
    });

    describe('EventEmitter', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.EventEmitter).to.be.a('function');
        });
    });

    describe('isMobile', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.isMobile).to.be.an('object');
        });

        it('should return a boolean for .any', function ()
        {
            expect(PIXI.utils.isMobile.any).to.be.a('boolean');
        });
    });
});
