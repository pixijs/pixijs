import fs from 'fs';
import path from 'path';
import { Renderer, settings, Texture } from '@pixi/core';
import { BitmapFont, BitmapText } from '@pixi/text-bitmap';

import type { Container } from '@pixi/display';

describe('BitmapText', () =>
{
    let resources: string;
    let fontXML: XMLDocument;
    let fontImage: HTMLImageElement;
    let font: BitmapFont;
    let font2: BitmapFont;
    let font2XML: XMLDocument;
    let texture: Texture;

    beforeAll((done) =>
    {
        fontXML = null;
        fontImage = null;
        font = null;

        const resolveURL = (url: string) => path.resolve(resources, url);
        const loadXML = (url: string) => new Promise<XMLDocument>((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).toBeNull();
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

    afterAll(() =>
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
        expect(font).toBeInstanceOf(BitmapFont);
        expect(font2).toBeInstanceOf(BitmapFont);
        expect(BitmapFont.available[font.font]).toEqual(font);
        expect(BitmapFont.available[font2.font]).toEqual(font2);
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

        const listener = jest.spyOn(text, 'addChild');

        text.updateText();

        expect(listener.mock.calls).toHaveLength(1);
        expect(text.children.length).toEqual(1);

        text.updateText();

        expect(listener.mock.calls).toHaveLength(1);
        expect(text.children.length).toEqual(1);

        text.text = 'hiya';

        text.updateText();

        expect(listener.mock.calls).toHaveLength(1);
        expect(text.children.length).toEqual(1);
    });

    it('should render text even if there are unsupported characters', () =>
    {
        const text = new BitmapText('ABCDEFG', {
            fontName: font.font,
        });

        text.updateText();
        expect(text['_activePagesMeshData'][0].total).toEqual(4);
    });
    it('should support font without page reference', () =>
    {
        const text = new BitmapText('A', {
            fontName: font2.font,
        });

        text.updateText();

        expect((text.children[0] as Container).width).toEqual(19);
        expect((text.children[0] as Container).height).toEqual(20);
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

        expect(bmpText.textWidth).toBeLessThanOrEqual(bmpText.maxWidth);

        bmpText.maxWidth = 40;
        bmpText.text = 'A A A A A A A';
        bmpText.updateText();

        expect(bmpText.textWidth).toBeLessThanOrEqual(bmpText.maxWidth);
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
                expect(bmpText.children[char].x).toEqual(prevPos + space + positions[char] - positions[char - 1]);
                prevPos = bmpText.children[char].x;
            }
        }
    });
    it('should not crash if text is undefined', () =>
    {
        let text = new BitmapText(undefined, {
            fontName: font.font,
        });

        expect(() => text.updateText()).not.toThrowError();

        text = new BitmapText('not undefined', {
            fontName: font.font,
        });

        text.text = undefined;

        expect(() => text.updateText()).not.toThrowError();
    });

    it('should set the text resolution to match the resolution setting when constructed time', () =>
    {
        const text = new BitmapText('foo', {
            fontName: font.font,
        });

        expect(text.resolution).toEqual(settings.RESOLUTION);
    });

    it('should update the text resolution to match the renderer resolution when being rendered to screen', () =>
    {
        const text = new BitmapText('foo', {
            fontName: font.font,
        });

        expect(text.resolution).toEqual(settings.RESOLUTION);

        const renderer = new Renderer({ resolution: 2 });

        expect(renderer.resolution).toEqual(2);

        renderer.render(text);

        expect(text.resolution).toEqual(renderer.resolution);

        renderer.destroy();
    });

    it('should use any manually set text resolution over the renderer resolution', () =>
    {
        const text = new BitmapText('foo', {
            fontName: font.font,
        });

        text.resolution = 3;

        expect(text.resolution).toEqual(3);

        const renderer = new Renderer({ resolution: 2 });

        renderer.render(text);

        expect(text.resolution).toEqual(3);

        renderer.destroy();
    });

    it('should update after font is replaced', () =>
    {
        BitmapFont.from('testFont');

        const text = new BitmapText('123ABCabc', {
            fontName: 'testFont',
        });

        const listener = jest.spyOn(text, 'updateText');

        text.textWidth; // Should trigger updateText()

        expect(listener.mock.calls).toHaveLength(1);

        text.textWidth; // Should not trigger updateText()

        expect(listener.mock.calls).toHaveLength(1);

        BitmapFont.from('testFont'); // Replace the font
        text.textWidth; // Should trigger updateText()

        expect(listener.mock.calls).toHaveLength(2);
    });

    it('should update fontSize when font is replaced if fontSize is undefined', () =>
    {
        BitmapFont.from('testFont', {
            fontSize: 12,
        });

        const text = new BitmapText('123ABCabc', {
            fontName: 'testFont',
        });

        expect(text.fontSize).toEqual(12);

        BitmapFont.from('testFont', {
            fontSize: 24,
        }); // Replace the font

        expect(text.fontSize).toEqual(24);
    });
    it('should not update fontSize when font is replaced if fontSize is defined', () =>
    {
        BitmapFont.from('testFont', {
            fontSize: 12,
        });

        const text = new BitmapText('123ABCabc', {
            fontName: 'testFont',
            fontSize: 16,
        });

        expect(text.fontSize).toEqual(16);

        BitmapFont.from('testFont', {
            fontSize: 24,
        }); // Replace the font

        expect(text.fontSize).toEqual(16);
    });

    it('should unset dirty after updateText', () =>
    {
        const text = new BitmapText('123ABCabc', {
            fontName: font.font,
        });

        expect(text.dirty).toBeTrue();

        text.updateText();

        expect(text.dirty).toBeFalse();

        text.dirty = true;

        text.updateText();

        expect(text.dirty).toBeFalse();
    });

    it('should support tinting', () =>
    {
        const text = new BitmapText('123ABCabc', {
            fontName: font.font,
        });

        text.tint = 'red';

        expect(text.tint).toEqual('red');

        text.updateText();

        text['_activePagesMeshData'].every((mesh) => mesh.mesh.tintValue === 0xff0000);

        text.destroy(true);
    });
});
