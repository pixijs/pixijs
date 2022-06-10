import path from 'path';
import fs from 'fs';
import { BitmapText, BitmapFont } from '@pixi/text-bitmap';
import { settings } from '@pixi/settings';
import { Texture, Renderer } from '@pixi/core';
import sinon from 'sinon';
import { expect } from 'chai';
import { Container } from '@pixi/display';

describe('BitmapText', () =>
{
    let resources: string;
    let fontXML: XMLDocument;
    let fontImage: HTMLImageElement;
    let font: BitmapFont;
    let font2: BitmapFont;
    let font2XML: XMLDocument;
    let texture: Texture;

    before((done) =>
    {
        fontXML = null;
        fontImage = null;
        font = null;

        const resolveURL = (url: string) => path.resolve(resources, url);
        const loadXML = (url: string) => new Promise<XMLDocument>((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).to.be.null;
                resolve((new window.DOMParser()).parseFromString(data, 'text/xml'));
            }));

        const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve) =>
        {
            const image = new Image();

            image.onload = () => resolve(image);
            image.src = resolveURL(url);
        });

        resources = path.join(__dirname, 'resources');
        Promise.all([
            loadXML('font.fnt'),
            loadXML('font-no-page.fnt'),
            loadImage('font.png'),
        ]).then(([
            _fontXML,
            _font2XML,
            _fontImage,
        ]) =>
        {
            fontXML = _fontXML;
            font2XML = _font2XML;
            fontImage = _fontImage;
            done();
        });
    });

    after(() =>
    {
        BitmapFont.uninstall(font.font);
        BitmapFont.uninstall(font2.font);
        texture.destroy(true);
        texture = null;
        font = null;
        font2 = null;
    });

    it('should register fonts from preloaded images', () =>
    {
        texture = Texture.from(fontImage);
        font = BitmapFont.install(fontXML, texture);
        font2 = BitmapFont.install(font2XML, texture);
        expect(font).instanceof(BitmapFont);
        expect(font2).instanceof(BitmapFont);
        expect(BitmapFont.available[font.font]).to.equal(font);
        expect(BitmapFont.available[font2.font]).to.equal(font2);
    });

    it('should have correct children when modified', () =>
    {
        BitmapFont.from('testFont', {
            fill: '#333333',
            fontSize: 4,
        });

        const text = new BitmapText('ABCDEFG', {
            fontName: 'testFont',
        });

        const listener = sinon.spy(text, 'addChild');

        text.updateText();

        expect(listener.callCount).to.equal(1);
        expect(text.children.length).to.equal(1);

        text.updateText();

        expect(listener.callCount).to.equal(1);
        expect(text.children.length).to.equal(1);

        text.text = 'hiya';

        text.updateText();

        expect(listener.callCount).to.equal(1);
        expect(text.children.length).to.equal(1);
    });

    it('should render text even if there are unsupported characters', () =>
    {
        const text = new BitmapText('ABCDEFG', {
            fontName: font.font,
        });

        text.updateText();
        expect(text['_activePagesMeshData'][0].total).to.equal(4);
    });
    it('should support font without page reference', () =>
    {
        const text = new BitmapText('A', {
            fontName: font2.font,
        });

        text.updateText();

        expect((text.children[0] as Container).width).to.equal(19);
        expect((text.children[0] as Container).height).to.equal(20);
    });
    it('should break line on space', () =>
    {
        const bmpText = new BitmapText('', {
            fontName: font.font,
            fontSize: 24,
        });

        bmpText.updateText();

        bmpText.maxWidth = 40;
        bmpText.text = 'A A A A A A A ';
        bmpText.updateText();

        expect(bmpText.textWidth).to.be.at.most(bmpText.maxWidth);

        bmpText.maxWidth = 40;
        bmpText.text = 'A A A A A A A';
        bmpText.updateText();

        expect(bmpText.textWidth).to.be.at.most(bmpText.maxWidth);
    });
    it('letterSpacing should add extra space between characters', () =>
    {
        const text = 'ABCD zz DCBA';
        const bmpText = new BitmapText(text, {
            fontName: font.font,
        });

        bmpText.updateText();

        const positions = [];
        const renderedChars = bmpText.children.length;

        for (let x = 0; x < renderedChars; ++x)
        {
            positions.push(bmpText.children[x].x);
        }
        for (let space = 1; space < 20; ++space)
        {
            bmpText.letterSpacing = space;
            bmpText.updateText();
            let prevPos = bmpText.children[0].x;

            for (let char = 1; char < renderedChars; ++char)
            {
                expect(bmpText.children[char].x).to.equal(prevPos + space + positions[char] - positions[char - 1]);
                prevPos = bmpText.children[char].x;
            }
        }
    });
    it('should not crash if text is undefined', () =>
    {
        let text = new BitmapText(undefined, {
            fontName: font.font,
        });

        expect(() => text.updateText()).to.not.throw();

        text = new BitmapText('not undefined', {
            fontName: font.font,
        });

        text.text = undefined;

        expect(() => text.updateText()).to.not.throw();
    });

    it('should set the text resolution to match the resolution setting when constructed time', () =>
    {
        const text = new BitmapText('foo', {
            fontName: font.font,
        });

        expect(text.resolution).to.equal(settings.RESOLUTION);
    });

    it('should update the text resolution to match the renderer resolution when being rendered to screen', () =>
    {
        const text = new BitmapText('foo', {
            fontName: font.font,
        });

        expect(text.resolution).to.equal(settings.RESOLUTION);

        const renderer = new Renderer({ resolution: 2 });

        expect(renderer.resolution).to.equal(2);

        renderer.render(text);

        expect(text.resolution).to.equal(renderer.resolution);

        renderer.destroy();
    });

    it('should use any manually set text resolution over the renderer resolution', () =>
    {
        const text = new BitmapText('foo', {
            fontName: font.font,
        });

        text.resolution = 3;

        expect(text.resolution).to.equal(3);

        const renderer = new Renderer({ resolution: 2 });

        renderer.render(text);

        expect(text.resolution).to.equal(3);

        renderer.destroy();
    });
});
