import { TextStyle } from '@pixi/text';
import { HTMLTextStyle } from '../src/HTMLTextStyle';

describe('HTMLTextStyle', () =>
{
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/text-html/test/resources/`
        : 'http://localhost:8080/text-html/test/resources/';

    it('should create an instance', () =>
    {
        expect(new HTMLTextStyle()).toBeTruthy();
    });

    describe('constructor', () =>
    {
        it('should set properties from constructor', () =>
        {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
            });

            expect(style.fontFamily).toBe('Times');
            expect(style.fontSize).toBe(12);
        });
    });

    describe('from', () =>
    {
        it('should import from TextStyle', () =>
        {
            expect(HTMLTextStyle.from(new TextStyle())).toBeTruthy();
        });
        it('should import from TextStyle and disconnect', () =>
        {
            const original = new TextStyle();
            const style = HTMLTextStyle.from(original);

            original.fontSize = 12;
            expect(original.fontSize).toBe(12);
            expect(style.fontSize).toBe(HTMLTextStyle.defaultOptions.fontSize);
        });
    });

    describe('addOverride', () =>
    {
        it('should add override', () =>
        {
            const style = new HTMLTextStyle();
            const id = style.styleID;

            style.addOverride('color: red');
            expect(style.styleID).toBe(id + 1);
        });

        it('should add override once', () =>
        {
            const style = new HTMLTextStyle();
            const id = style.styleID;

            style.addOverride('color: red');
            style.addOverride('color: red');
            expect(style.styleID).toBe(id + 1);
        });

        it('should remove override', () =>
        {
            const style = new HTMLTextStyle();
            const id = style.styleID;

            style.addOverride('color: red');
            style.removeOverride('color: red');
            expect(style.styleID).toBe(id + 2);
        });

        it('should remove override once', () =>
        {
            const style = new HTMLTextStyle();
            const id = style.styleID;

            style.addOverride('color: red');
            style.removeOverride('color: red');
            style.removeOverride('color: red');
            expect(style.styleID).toBe(id + 2);
        });
    });

    describe('toCSS', () =>
    {
        it('should converto CSS', () =>
        {
            const style = new HTMLTextStyle();

            expect(style.toCSS(1)).toMatchSnapshot();
        });

        it('should insert overrides', () =>
        {
            const style = new HTMLTextStyle();

            style.addOverride('color: red');
            expect(style.toCSS(1)).toMatchSnapshot();
        });

        it('should respect scale', () =>
        {
            const style = new HTMLTextStyle({
                lineHeight: 50,
                wordWrap: true,
                wordWrapWidth: 200,
            });

            expect(style.toCSS(2)).toMatchSnapshot();
        });
    });

    describe('toGlobalCSS', () =>
    {
        it('should converto CSS', () =>
        {
            const style = new HTMLTextStyle();

            expect(style.toGlobalCSS()).toMatchSnapshot();
        });

        it('should converto CSS', () =>
        {
            const style = new HTMLTextStyle();
            const id = style.styleID;

            style.stylesheet = `p { color: red; }`;

            expect(style.toGlobalCSS()).toMatchSnapshot();
            expect(style.styleID).toBe(id + 1);
        });
    });

    describe('loadFont', () =>
    {
        it('should load a font', async () =>
        {
            const style = new HTMLTextStyle();
            const id = style.styleID;
            const url = `${serverPath}Herborn.ttf`;

            await style.loadFont(url);

            expect(HTMLTextStyle.availableFonts[url]).toBeTruthy();
            expect(Object.keys(HTMLTextStyle.availableFonts).length).toBe(1);
            expect(style.styleID).toBe(id + 2); // 1 for font, 1 for install
            expect(style.toGlobalCSS()).toContain('font-family: "Herborn"');

            style.cleanFonts();

            expect(Object.keys(HTMLTextStyle.availableFonts).length).toBe(0);
            expect(style.styleID).toBe(id + 3);
        });

        it('should allow for family, style, weight overrides', async () =>
        {
            const style = new HTMLTextStyle();
            const url = `${serverPath}Herborn.ttf`;

            await style.loadFont(url, {
                family: 'MyFont',
                style: 'italic',
                weight: 'bold',
            });

            const font = HTMLTextStyle.availableFonts[url];

            expect(font.family).toBe('MyFont');
            expect(font.style).toBe('italic');
            expect(font.weight).toBe('bold');

            style.cleanFonts();
        });

        it('should load a font with ref-counting', async () =>
        {
            const style1 = new HTMLTextStyle();
            const style2 = new HTMLTextStyle();
            const style3 = new HTMLTextStyle();
            const url = `${serverPath}Herborn.ttf`;

            await style1.loadFont(url);
            await style2.loadFont(url);
            await style3.loadFont(url);

            expect(HTMLTextStyle.availableFonts[url].refs).toBe(3);
            expect(Object.keys(HTMLTextStyle.availableFonts).length).toBe(1);

            style1.cleanFonts();

            expect(HTMLTextStyle.availableFonts[url].refs).toBe(2);
            expect(Object.keys(HTMLTextStyle.availableFonts).length).toBe(1);

            style2.cleanFonts();
            expect(HTMLTextStyle.availableFonts[url].refs).toBe(1);
            expect(Object.keys(HTMLTextStyle.availableFonts).length).toBe(1);

            style3.cleanFonts();

            expect(HTMLTextStyle.availableFonts[url]).toBeFalsy();
            expect(Object.keys(HTMLTextStyle.availableFonts).length).toBe(0);
        });
    });
});
