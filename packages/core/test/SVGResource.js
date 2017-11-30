const { resources } = require('../');
const { SVGResource } = resources;

describe('PIXI.resources.SVGResource', function ()
{
    describe('getSize', function ()
    {
        it('should exist', function ()
        {
            expect(SVGResource.getSize)
                .to.be.a('function');
        });

        it('should return a size object with width and height from an SVG string', function ()
        {
            const svgSize = SVGResource.getSize('<svg height="32" width="64"></svg>');

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should return a size object from an SVG string with inverted quotes', function ()
        {
            const svgSize = SVGResource.getSize("<svg height='32' width='64'></svg>"); // eslint-disable-line quotes

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should work with px values', function ()
        {
            const svgSize = SVGResource.getSize('<svg height="32px" width="64px"></svg>');

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should return an empty object when width and/or height is missing', function ()
        {
            const svgSize = SVGResource.getSize('<svg width="64"></svg>');

            expect(Object.keys(svgSize).length)
                .to.equal(0);
        });
    });
});
