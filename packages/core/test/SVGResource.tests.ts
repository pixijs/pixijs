import { SVGResource } from '@pixi/core';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

describe('SVGResource', function ()
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

            expect(resource.valid).to.equal(false);
            resource.load().then(function ()
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create new resource from data-uri with charset=utf8', function (done)
        {
            const url = path.join(this.resources, 'svg-base64-utf8.txt');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            expect(resource.valid).to.equal(false);
            resource.load().then(function ()
            {
                expect(resource.valid).to.equal(true);
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

            expect(resource.valid).to.equal(false);
            resource.load().then(function ()
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create resource from SVG URL with {scale: 2.123}', function (done)
        {
            const resource = new SVGResource(
                path.join(this.resources, 'heart.svg'),
                {
                    autoLoad: false,
                    scale: 2.123,
                }
            );

            resource.load().then(function ()
            {
                expect(resource.width).to.equal(212);
                expect(resource.height).to.equal(212);

                done();
            });
        });

        it('should create resource from SVG URL with {width: 10}', function (done)
        {
            const resource = new SVGResource(
                path.join(this.resources, 'heart.svg'),
                {
                    autoLoad: false,
                    width: 10,
                }
            );

            resource.load().then(function ()
            {
                expect(resource.width).to.equal(10);
                expect(resource.height).to.equal(10);

                done();
            });
        });

        it('should create resource from SVG URL with {width: 10, height: 10}', function (done)
        {
            const resource = new SVGResource(
                path.join(this.resources, 'heart.svg'),
                {
                    autoLoad: false,
                    width: 10,
                    height: 10,
                }
            );

            resource.load().then(function ()
            {
                expect(resource.width).to.equal(10);
                expect(resource.height).to.equal(10);

                done();
            });
        });

        it('should create resource from inline SVG', function (done)
        {
            const url = path.join(this.resources, 'heart.svg');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            expect(resource.valid).to.equal(false);
            resource.load().then(function ()
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });
    });

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

    describe('test', function ()
    {
        it('should pass simple SVG document', function ()
        {
            const didPass = SVGResource.test(`<svg></svg>`, 'xml');

            expect(didPass).to.equal(true);
        });

        it('should pass SVG document with prolog', function ()
        {
            const didPass = SVGResource.test(`
                <?xml version="1.0" encoding="utf-8" ?>
                <!-- This image/svg document is being tested! Not leaving a space at the end on purpose.-->
                <svg>Hello world</svg>
            `, 'xml');

            expect(didPass).to.equal(true);
        });

        it('should pass SVG document with only prolog, no comments', function ()
        {
            const didPass = SVGResource.test(
                `<?xml version="1.0" encoding="utf-8" ?><svg>Hello world</svg>`,
                'xml');

            expect(didPass).to.equal(true);
        });

        it('should not pass HTML fragment', function ()
        {
            const didPass = SVGResource.test(
                `<html><body>This is a mistake</body></html>`,
                'xml');

            expect(didPass).to.equal(false);
        });
    });
});
