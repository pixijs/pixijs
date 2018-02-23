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

        // it('should properly convert number to hex color string');
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
            expect(dataUri.encoding)
                .to.equal('base64');
            expect(dataUri.data)
                .to.equal('94Z9RWUN77ZW');
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

    describe('mixins', function ()
    {
        it('should exist', function ()
        {
            expect(utils.mixins).to.be.an('object');
        });

        it('should perform mixins', function ()
        {
            // eslint-disable-next-line
            const target = function () {};
            const source = {
                foo: true,
                bar: 1,
            };

            utils.mixins.delayMixin(target.prototype, source);
            expect(target.prototype.foo).to.be.undefined;
            expect(target.prototype.bar).to.be.undefined;

            utils.mixins.performMixins();
            expect(target.prototype.foo).to.equal(true);
            expect(target.prototype.bar).to.equal(1);
        });
    });

    describe('earcut', function ()
    {
        it('should exist', function ()
        {
            expect(PIXI.utils.earcut).to.be.a('function');
        });
    });
});
