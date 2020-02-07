const path = require('path');
const fs = require('fs');
const { BitmapText, BitmapFont } = require('../');
const { Texture } = require('@pixi/core');

describe('PIXI.BitmapText', function ()
{
    before(function (done)
    {
        this.fontXML = null;
        this.fontImage = null;
        this.font = null;

        const resolveURL = (url) => path.resolve(this.resources, url);
        const loadXML = (url) => new Promise((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).to.be.null;
                resolve((new window.DOMParser()).parseFromString(data, 'text/xml'));
            }));

        const loadImage = (url) => new Promise((resolve) =>
        {
            const image = new Image();

            image.onload = () => resolve(image);
            image.src = resolveURL(url);
        });

        this.resources = path.join(__dirname, 'resources');
        Promise.all([
            loadXML('font.fnt'),
            loadXML('font-no-page.fnt'),
            loadImage('font.png'),
        ]).then(([
            fontXML,
            font2XML,
            fontImage,
        ]) =>
        {
            this.fontXML = fontXML;
            this.font2XML = font2XML;
            this.fontImage = fontImage;
            done();
        });
    });

    after(function ()
    {
        BitmapFont.uninstall(this.font.font);
        BitmapFont.uninstall(this.font2.font);
        this.texture.destroy(true);
        this.texture = null;
        this.font = null;
        this.font2 = null;
    });

    it('should register fonts from preloaded images', function ()
    {
        this.texture = Texture.from(this.fontImage);
        this.font = BitmapFont.install(this.fontXML, this.texture);
        this.font2 = BitmapFont.install(this.font2XML, this.texture);
        expect(this.font).instanceof(BitmapFont);
        expect(this.font2).instanceof(BitmapFont);
        expect(BitmapFont.available[this.font.font]).to.equal(this.font);
        expect(BitmapFont.available[this.font2.font]).to.equal(this.font2);
    });
    it('should render text even if there are unsupported characters', function ()
    {
        const text = new BitmapText('ABCDEFG', {
            font: this.font.font,
        });

        expect(text.children.length).to.equal(4);
    });
    it('should support font without page reference', function ()
    {
        const text = new BitmapText('A', {
            font: this.font2.font,
        });

        expect(text.children[0].width).to.equal(19);
        expect(text.children[0].height).to.equal(20);
    });
    it('should break line on space', function ()
    {
        const bmpText = new BitmapText('', {
            font: this.font.font,
            size: 24,
        });

        bmpText.maxWidth = 40;
        bmpText.text = 'A A A A A A A ';
        bmpText.updateText();

        expect(bmpText.textWidth).to.lessThan(bmpText.maxWidth);

        bmpText.maxWidth = 40;
        bmpText.text = 'A A A A A A A';
        bmpText.updateText();

        expect(bmpText.textWidth).to.lessThan(bmpText.maxWidth);
    });
    it('letterSpacing should add extra space between characters', function ()
    {
        const text = 'ABCD zz DCBA';
        const bmpText = new BitmapText(text, {
            font: this.font.font,
        });
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
});
