const { resources } = require('../');
const { SVGResource } = resources;
const fs = require('fs');
const path = require('path');

describe('PIXI.resources.SVGResource', function ()
{
    before(function ()
    {
        this.resources = path.join(__dirname, 'resources');
    });

    describe('constructor', function ()
    {
        it('should create new resource from data-uri', function (done)
        {
            const url = path.join(this.resources, 'svg-base64.txt');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            resource.load().then(function ()
            {
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create resource from SVG URL', function (done)
        {
            const resource = new SVGResource(
                path.join(this.resources, 'heart.svg'),
                { autoLoad: false }
            );

            resource.load().then(function ()
            {
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create resource from inline SVG', function (done)
        {
            const url = path.join(this.resources, 'heart.svg');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            resource.load().then(function ()
            {
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });
    });
});
