import { SVGResource } from '@pixi/core';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

describe('SVGResource', () =>
{
    let resources: string;

    before(() =>
    {
        resources = path.join(__dirname, 'resources');
    });

    describe('constructor', () =>
    {
        it('should create new resource from data-uri', (done) =>
        {
            const url = path.join(resources, 'svg-base64.txt');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            expect(resource.valid).to.equal(false);
            resource.load().then(() =>
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create new resource from data-uri with charset=utf8', (done) =>
        {
            const url = path.join(resources, 'svg-base64-utf8.txt');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            expect(resource.valid).to.equal(false);
            resource.load().then(() =>
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create resource from SVG URL', (done) =>
        {
            const resource = new SVGResource(
                path.join(resources, 'heart.svg'),
                { autoLoad: false }
            );

            expect(resource.valid).to.equal(false);
            resource.load().then(() =>
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create resource from SVG URL with {scale: 2.123}', (done) =>
        {
            const resource = new SVGResource(
                path.join(resources, 'heart.svg'),
                {
                    autoLoad: false,
                    scale: 2.123,
                }
            );

            resource.load().then(() =>
            {
                expect(resource.width).to.equal(212);
                expect(resource.height).to.equal(212);

                done();
            });
        });

        it('should create resource from SVG URL with {width: 10}', (done) =>
        {
            const resource = new SVGResource(
                path.join(resources, 'heart.svg'),
                {
                    autoLoad: false,
                    width: 10,
                }
            );

            resource.load().then(() =>
            {
                expect(resource.width).to.equal(10);
                expect(resource.height).to.equal(10);

                done();
            });
        });

        it('should create resource from SVG URL with {width: 10, height: 10}', (done) =>
        {
            const resource = new SVGResource(
                path.join(resources, 'heart.svg'),
                {
                    autoLoad: false,
                    width: 10,
                    height: 10,
                }
            );

            resource.load().then(() =>
            {
                expect(resource.width).to.equal(10);
                expect(resource.height).to.equal(10);

                done();
            });
        });

        it('should create resource from inline SVG', (done) =>
        {
            const url = path.join(resources, 'heart.svg');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            expect(resource.valid).to.equal(false);
            resource.load().then(() =>
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(100);
                expect(resource.height).to.equal(100);

                done();
            });
        });

        it('should create resource from SVG with XML Prolog', (done) =>
        {
            const url = path.join(resources, 'circle-with-prolog.svg');
            const buffer = fs.readFileSync(url, 'utf8');
            const resource = new SVGResource(buffer, { autoLoad: false });

            expect(buffer.startsWith('<?xml')).to.equal(true);
            expect(resource.valid).to.equal(false);
            resource.load().then(() =>
            {
                expect(resource.valid).to.equal(true);
                expect(resource.width).to.equal(48);
                expect(resource.height).to.equal(48);

                done();
            });
        });
    });

    describe('getSize', () =>
    {
        it('should exist', () =>
        {
            expect(SVGResource.getSize)
                .to.be.a('function');
        });

        it('should return a size object with width and height from an SVG string', () =>
        {
            const svgSize = SVGResource.getSize('<svg height="32" width="64"></svg>');

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should return a size object from an SVG string with inverted quotes', () =>
        {
            const svgSize = SVGResource.getSize('<svg height=\'32\' width=\'64\'></svg>'); // eslint-disable-line quotes

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should work with px values', () =>
        {
            const svgSize = SVGResource.getSize('<svg height="32px" width="64px"></svg>');

            expect(svgSize)
                .to.be.an('object');
            expect(svgSize.width)
                .to.equal(64);
            expect(svgSize.height)
                .to.equal(32);
        });

        it('should return an empty object when width and/or height is missing', () =>
        {
            const svgSize = SVGResource.getSize('<svg width="64"></svg>');

            expect(Object.keys(svgSize).length)
                .to.equal(0);
        });
    });

    describe('test', () =>
    {
        it('should pass simple SVG document', () =>
        {
            const didPass = SVGResource.test(`<svg></svg>`, 'xml');

            expect(didPass).to.equal(true);
        });

        it('should pass SVG document with prolog', () =>
        {
            const didPass = SVGResource.test(`
                <?xml version="1.0" encoding="utf-8" ?>
                <!-- This image/svg document is being tested! Not leaving a space at the end on purpose.-->
                <svg>Hello world</svg>
            `, 'xml');

            expect(didPass).to.equal(true);
        });

        it('should pass SVG document with only prolog, no comments', () =>
        {
            const didPass = SVGResource.test(
                `<?xml version="1.0" encoding="utf-8" ?><svg>Hello world</svg>`,
                'xml');

            expect(didPass).to.equal(true);
        });

        it('should not pass HTML fragment', () =>
        {
            const didPass = SVGResource.test(
                `<html><body>This is a mistake</body></html>`,
                'xml');

            expect(didPass).to.equal(false);
        });
    });
});
