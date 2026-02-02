/* eslint-disable jest/no-commented-out-tests */
import { FillGradient } from '../../graphics/shared/fill/FillGradient';
import { FillPattern } from '../../graphics/shared/fill/FillPattern';
import { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import { HTMLTextStyle } from '../../text-html/HTMLTextStyle';
import { SplitText } from '../../text-split/SplitText';
import { Text } from '../Text';
import { TextStyle } from '../TextStyle';
import { Color } from '~/color';
import { BlurFilter } from '~/filters';
import { Texture } from '~/rendering';

import type { FillStyle, StrokeStyle } from '../../graphics/shared/FillTypes';
import type { TextStyleOptions } from '../TextStyle';

describe('TextStyle', () =>
{
    it('reset reverts style to default', () =>
    {
        const textStyle = new TextStyle();
        const defaultFontSize = textStyle.fontSize;

        textStyle.fontSize = 1000;

        expect(textStyle.fontSize).toEqual(1000);
        textStyle.reset();
        expect(textStyle.fontSize).toEqual(defaultFontSize);
    });

    describe('clone', () =>
    {
        it('should clone all basic properties', () =>
        {
            const style = new TextStyle({
                align: 'center',
                breakWords: true,
                fontFamily: 'Georgia',
                fontSize: 48,
                fontStyle: 'italic',
                fontVariant: 'small-caps',
                fontWeight: 'bold',
                leading: 5,
                letterSpacing: 2,
                lineHeight: 30,
                padding: 10,
                textBaseline: 'top',
                trim: true,
                whiteSpace: 'normal',
                wordWrap: true,
                wordWrapWidth: 200,
            });

            const cloned = style.clone();

            expect(cloned.align).toBe('center');
            expect(cloned.breakWords).toBe(true);
            expect(cloned.fontFamily).toBe('Georgia');
            expect(cloned.fontSize).toBe(48);
            expect(cloned.fontStyle).toBe('italic');
            expect(cloned.fontVariant).toBe('small-caps');
            expect(cloned.fontWeight).toBe('bold');
            expect(cloned.leading).toBe(5);
            expect(cloned.letterSpacing).toBe(2);
            expect(cloned.lineHeight).toBe(30);
            expect(cloned.padding).toBe(10);
            expect(cloned.textBaseline).toBe('top');
            expect(cloned.trim).toBe(true);
            expect(cloned.whiteSpace).toBe('normal');
            expect(cloned.wordWrap).toBe(true);
            expect(cloned.wordWrapWidth).toBe(200);
        });

        it('should clone fill', () =>
        {
            const style = new TextStyle({
                fill: { color: 0xff0000, alpha: 0.5 },
            });

            const cloned = style.clone();

            expect(cloned._fill.color).toBe(0xff0000);
            expect(cloned._fill.alpha).toBe(0.5);
        });

        it('should clone stroke', () =>
        {
            const style = new TextStyle({
                stroke: { color: 0x00ff00, width: 3 },
            });

            const cloned = style.clone();

            expect(cloned._stroke.color).toBe(0x00ff00);
            expect(cloned._stroke.width).toBe(3);
        });

        it('should clone dropShadow', () =>
        {
            const style = new TextStyle({
                dropShadow: {
                    alpha: 0.7,
                    angle: 45,
                    blur: 5,
                    color: 0x333333,
                    distance: 10,
                },
            });

            const cloned = style.clone();

            expect(cloned.dropShadow).toEqual({
                alpha: 0.7,
                angle: 45,
                blur: 5,
                color: 0x333333,
                distance: 10,
            });
        });

        it('should clone null dropShadow', () =>
        {
            const style = new TextStyle({ dropShadow: null });

            const cloned = style.clone();

            expect(cloned.dropShadow).toBeNull();
        });

        it('should clone filters', () =>
        {
            const filter = new BlurFilter();
            const style = new TextStyle({ filters: [filter] });

            const cloned = style.clone();

            expect(cloned.filters).toHaveLength(1);
            expect(cloned.filters[0]).toBe(filter);
        });

        it('should clone tagStyles', () =>
        {
            const style = new TextStyle({
                tagStyles: {
                    red: { fill: 0xff0000 },
                    bold: { fontWeight: 'bold' },
                },
            });

            const cloned = style.clone();

            expect(cloned.tagStyles).toEqual({
                red: { fill: 0xff0000 },
                bold: { fontWeight: 'bold' },
            });
        });

        it('should create independent clone (modifying clone does not affect original)', () =>
        {
            const original = new TextStyle({
                fontSize: 24,
                fill: { color: 0xff0000, alpha: 1 },
                stroke: { color: 0x00ff00, width: 2 },
                dropShadow: { alpha: 0.5, angle: 0, blur: 4, color: 0x000000, distance: 5 },
            });

            const cloned = original.clone();

            cloned.fontSize = 48;
            (cloned.fill as FillStyle).alpha = 0.5;
            (cloned.stroke as StrokeStyle).width = 10;
            cloned.dropShadow.blur = 20;

            expect(original.fontSize).toBe(24);
            expect(original._fill.alpha).toBe(1);
            expect(original._stroke.width).toBe(2);
            expect(original.dropShadow.blur).toBe(4);
        });

        it('should create independent clone (modifying original does not affect clone)', () =>
        {
            const original = new TextStyle({
                fontSize: 24,
                fill: { color: 0xff0000, alpha: 1 },
                stroke: { color: 0x00ff00, width: 2 },
            });

            const cloned = original.clone();

            original.fontSize = 48;
            (original.fill as FillStyle).alpha = 0.5;
            (original.stroke as StrokeStyle).width = 10;

            expect(cloned.fontSize).toBe(24);
            expect(cloned._fill.alpha).toBe(1);
            expect(cloned._stroke.width).toBe(2);
        });

        it('should preserve fill/stroke proxy updates when passing TextStyle to constructor', () =>
        {
            const original = new TextStyle({
                fill: { color: 0xff0000, alpha: 1 },
                stroke: { color: 0x00ff00, width: 1 },
            });

            (original.fill as FillStyle).alpha = 0.3;
            (original.stroke as StrokeStyle).width = 7;

            const copy = new TextStyle(original);

            expect(copy._fill.alpha).toBe(0.3);
            expect(copy._stroke.width).toBe(7);
        });

        it('should create independent fill/stroke when passing TextStyle to constructor', () =>
        {
            const original = new TextStyle({
                fill: { color: 0xff0000, alpha: 1 },
                stroke: { color: 0x00ff00, width: 1 },
            });

            const copy = new TextStyle(original);

            (copy.fill as FillStyle).alpha = 0.2;
            (copy.stroke as StrokeStyle).width = 9;

            expect(original._fill.alpha).toBe(1);
            expect(original._stroke.width).toBe(1);
        });
    });

    it('should assume pixel fonts', () =>
    {
        // note: had to convert to HTMLTextStyle since textStyleToCSS only supports it
        const style = new HTMLTextStyle({ fontSize: 72 });
        const font = style.cssStyle;

        expect(font).toBeString();
        expect(font).toContain('font-size: 72px');
    });

    it('should handle multiple fonts as array', () =>
    {
        const fontFamily = ['Georgia', 'Arial', 'sans-serif'];
        const style = new HTMLTextStyle({
            fontFamily,
        });

        expect(style.cssStyle).toContain(fontFamily.join(','));
    });

    it('should handle multiple fonts as string', () =>
    {
        const style = new HTMLTextStyle({
            fontFamily: 'Georgia,"Arial",sans-serif',
        });

        expect(style.cssStyle).toContain(style.fontFamily);
    });

    // note: gradients?
    // it('should not shared array / object references between different instances', () =>
    // {
    //     const defaultStyle = new TextStyle();
    //     const style = new TextStyle();

    //     expect(defaultStyle.fillGradientStops.length).toEqual(style.fillGradientStops.length);
    //     style.fillGradientStops.push(0);
    //     expect(defaultStyle.fillGradientStops.length).not.toEqual(style.fillGradientStops.length);
    // });

    it('should not quote generic font families when calling toFontString', () =>
    {
        // Should match the list in TextStyle
        const genericFontFamilies = [
            'serif',
            'sans-serif',
            'monospace',
            'cursive',
            'fantasy',
            'system-ui',
        ];

        // Regex to find any of the generic families surrounded by either type of quote mark
        const incorrectRegexTemplate = '["\']FAMILY["\']';

        for (const genericFamily of genericFontFamilies)
        {
            const style = new HTMLTextStyle({
                fontFamily: ['Georgia', 'Arial', genericFamily],
            });

            // Create regex from template substituting target family
            const regex = new RegExp(incorrectRegexTemplate.replace('FAMILY', genericFamily));
            const result = style.cssStyle.match(regex);

            expect(result).toBeNull();
        }
    });

    it('should convert dropShadow properties', () =>
    {
        const style = {
            dropShadow: true,
            dropShadowAlpha: 0.5,
            dropShadowAngle: 45,
            dropShadowBlur: 10,
            dropShadowColor: 0x000000,
            dropShadowDistance: 5,
        };

        const textstyle = new TextStyle(style);

        expect(textstyle.dropShadow).toEqual({
            alpha: 0.5,
            angle: 45,
            blur: 10,
            color: 0x000000,
            distance: 5,
        });

        const style2 = {
            dropShadow: false,
            dropShadowAlpha: 0.5,
        };

        const textstyle2 = new TextStyle(style2);

        expect(textstyle2.dropShadow).toBeNull();
    });

    it('should convert strokeThickness property for colors', () =>
    {
        const style = {
            stroke: 0xff0000,
            strokeThickness: 5,
        };

        expect(new TextStyle(style)._stroke).toEqual({
            ...GraphicsContext.defaultStrokeStyle,
            color: 0xff0000,
            width: 5,
        });

        const style2 = {
            stroke: new Color(0xff0000),
            strokeThickness: 5,
        };

        expect(new TextStyle(style2)._stroke).toEqual({
            ...GraphicsContext.defaultStrokeStyle,
            color: 0xff0000,
            width: 5,
        });

        const style3 = {
            stroke: {
                color: 0xff0000,
            },
            strokeThickness: 5,
        };

        expect(new TextStyle(style3)._stroke).toEqual({
            ...GraphicsContext.defaultStrokeStyle,
            color: 0xff0000,
            width: 5,
        });

        const style4 = {
            stroke: {
                color: new Color(0xff0000),
            },
            strokeThickness: 5,
        };

        expect(new TextStyle(style4)._stroke).toEqual({
            ...GraphicsContext.defaultStrokeStyle,
            color: 0xff0000,
            width: 5,
        });
    });

    it('should keep other stroke properties', () =>
    {
        const style: TextStyleOptions & {strokeThickness: number} = {
            stroke: {
                color: 0xff0000,
                alignment: 0.5,
                cap: 'round',
                join: 'round',
                miterLimit: 15,
            },
            strokeThickness: 5,
        };

        expect(new TextStyle(style)._stroke).toEqual({
            ...GraphicsContext.defaultStrokeStyle,
            color: 0xff0000,
            width: 5,
            alignment: 0.5,
            cap: 'round',
            join: 'round',
            miterLimit: 15,
        });
    });

    it('should convert fill object to FillPattern', () =>
    {
        const pattern = new FillPattern(Texture.WHITE);
        const style = {
            stroke: pattern,
            strokeThickness: 5,
        };

        const textStyle = new TextStyle(style);

        expect(textStyle._stroke.fill).toBeInstanceOf(FillPattern);
        expect(textStyle._stroke).toEqual({
            ...GraphicsContext.defaultStrokeStyle,
            fill: pattern,
            width: 5,
            texture: pattern.texture,
            matrix: pattern.transform,
        });
    });

    it('should convert fillGradientStops array to FillGradient', () =>
    {
        const style = {
            fill: [0x000000, 0xff0000, 0xFFFFFF],
            fillGradientStops: [0, 0.5, 1],
        };

        const textStyle = new TextStyle(style as TextStyleOptions);

        expect(textStyle._fill.fill).toBeInstanceOf(FillGradient);
        expect((textStyle._fill.fill as FillGradient).colorStops).toEqual([
            { offset: 0, color: '#000000ff' },
            { offset: 0.5, color: '#ff0000ff' },
            { offset: 1, color: '#ffffffff' },
        ]);
    });

    describe('stroke proxy and clone', () =>
    {
        it('should preserve stroke width after proxy update and clone', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: 0xffffff,
                stroke: { color: 0xff0000 },
            });

            expect(style._stroke.width).toBe(GraphicsContext.defaultStrokeStyle.width);

            (style.stroke as StrokeStyle).width = 5;

            expect(style._stroke.width).toBe(5);

            const cloned = style.clone();

            expect(cloned._stroke.width).toBe(5);
        });

        it('should preserve stroke width when setting style on Text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: 0xffffff,
                stroke: { color: 0xff0000 },
            });

            (style.stroke as StrokeStyle).width = 5;

            const cloned = style.clone();
            const text = new Text({ text: 'A', style: cloned });

            expect(text.style._stroke.width).toBe(5);
        });

        it('should preserve stroke width when assigning style to existing Text', () =>
        {
            const text = new Text({
                text: 'A',
                style: {
                    fontSize: 24,
                    fill: 0xffffff,
                    stroke: { color: 0xff0000 },
                },
            });

            expect(text.style._stroke.width).toBe(1);

            (text.style.stroke as StrokeStyle).width = 5;

            const cloned = text.style.clone();
            const text2 = new Text({ text: 'B', style: { fontSize: 12 } });

            text2.style = cloned;

            expect(text.style._stroke.width).toBe(5);
            expect(text2.style._stroke.width).toBe(5);
        });

        it('should update stroke on SplitText chars when style.stroke changes', () =>
        {
            const text = new Text({
                text: 'AB',
                style: {
                    fontSize: 24,
                    fill: 0xffffff,
                    stroke: { color: 0xff0000 },
                },
            });

            const splitText = SplitText.from(text);

            expect(splitText.chars.length).toBeGreaterThan(0);
            expect(splitText.chars[0].style._stroke.width).toBe(1);
            expect(splitText.style._stroke.width).toBe(1);

            (splitText.style.stroke as StrokeStyle).width = 5;
            splitText.styleChanged();

            expect(splitText.style._stroke.width).toBe(5);
            expect(splitText.chars[0].style._stroke.width).toBe(5);
        });
    });

    describe('fill proxy and clone', () =>
    {
        it('should preserve fill alpha after proxy update and clone', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: { color: 0xff0000, alpha: 1 },
            });

            expect(style._fill.alpha).toBe(1);

            (style.fill as FillStyle).alpha = 0.5;

            expect(style._fill.alpha).toBe(0.5);

            const cloned = style.clone();

            expect(cloned._fill.alpha).toBe(0.5);
        });

        it('should preserve fill color after proxy update and clone', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: { color: 0xff0000 },
            });

            expect(style._fill.color).toBe(0xff0000);

            (style.fill as FillStyle).color = 0x00ff00;

            expect(style._fill.color).toBe(0x00ff00);

            const cloned = style.clone();

            expect(cloned._fill.color).toBe(0x00ff00);
        });

        it('should preserve fill when setting style on Text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: { color: 0xff0000, alpha: 1 },
            });

            (style.fill as FillStyle).alpha = 0.5;
            (style.fill as FillStyle).color = 0x00ff00;

            const cloned = style.clone();
            const text = new Text({ text: 'A', style: cloned });

            expect(text.style._fill.alpha).toBe(0.5);
            expect(text.style._fill.color).toBe(0x00ff00);
        });

        it('should preserve fill when assigning style to existing Text', () =>
        {
            const text = new Text({
                text: 'A',
                style: {
                    fontSize: 24,
                    fill: { color: 0xff0000, alpha: 1 },
                },
            });

            expect(text.style._fill.alpha).toBe(1);

            (text.style.fill as FillStyle).alpha = 0.5;
            (text.style.fill as FillStyle).color = 0x00ff00;

            const cloned = text.style.clone();
            const text2 = new Text({ text: 'B', style: { fontSize: 12 } });

            text2.style = cloned;

            expect(text.style._fill.alpha).toBe(0.5);
            expect(text.style._fill.color).toBe(0x00ff00);
            expect(text2.style._fill.alpha).toBe(0.5);
            expect(text2.style._fill.color).toBe(0x00ff00);
        });

        it('should update fill on SplitText chars when style.fill changes', () =>
        {
            const text = new Text({
                text: 'AB',
                style: {
                    fontSize: 24,
                    fill: { color: 0xff0000, alpha: 1 },
                },
            });

            const splitText = SplitText.from(text);

            expect(splitText.chars.length).toBeGreaterThan(0);
            expect(splitText.chars[0].style._fill.alpha).toBe(1);
            expect(splitText.style._fill.alpha).toBe(1);

            (splitText.style.fill as FillStyle).alpha = 0.5;
            (splitText.style.fill as FillStyle).color = 0x00ff00;
            splitText.styleChanged();

            expect(splitText.style._fill.alpha).toBe(0.5);
            expect(splitText.style._fill.color).toBe(0x00ff00);
            expect(splitText.chars[0].style._fill.alpha).toBe(0.5);
            expect(splitText.chars[0].style._fill.color).toBe(0x00ff00);
        });
    });

    describe('toObject', () =>
    {
        it('should return all basic properties', () =>
        {
            const style = new TextStyle({
                align: 'center',
                breakWords: true,
                fontFamily: 'Georgia',
                fontSize: 48,
                fontStyle: 'italic',
                fontVariant: 'small-caps',
                fontWeight: 'bold',
                leading: 5,
                letterSpacing: 2,
                lineHeight: 30,
                padding: 10,
                textBaseline: 'top',
                trim: true,
                whiteSpace: 'normal',
                wordWrap: true,
                wordWrapWidth: 200,
            });

            const obj = style['_toObject']();

            expect(obj.align).toBe('center');
            expect(obj.breakWords).toBe(true);
            expect(obj.fontFamily).toBe('Georgia');
            expect(obj.fontSize).toBe(48);
            expect(obj.fontStyle).toBe('italic');
            expect(obj.fontVariant).toBe('small-caps');
            expect(obj.fontWeight).toBe('bold');
            expect(obj.leading).toBe(5);
            expect(obj.letterSpacing).toBe(2);
            expect(obj.lineHeight).toBe(30);
            expect(obj.padding).toBe(10);
            expect(obj.textBaseline).toBe('top');
            expect(obj.trim).toBe(true);
            expect(obj.whiteSpace).toBe('normal');
            expect(obj.wordWrap).toBe(true);
            expect(obj.wordWrapWidth).toBe(200);
        });

        it('should return fill as FillStyle object', () =>
        {
            const style = new TextStyle({
                fill: { color: 0xff0000, alpha: 0.5 },
            });

            const obj = style['_toObject']();

            expect(obj.fill).toEqual(expect.objectContaining({
                color: 0xff0000,
                alpha: 0.5,
            }));
        });

        it('should return stroke with all properties', () =>
        {
            const style = new TextStyle({
                stroke: { color: 0x00ff00, width: 3 },
            });

            const obj = style['_toObject']();

            expect(obj.stroke).toEqual(expect.objectContaining({
                color: 0x00ff00,
                width: 3,
            }));
        });

        it('should return undefined stroke when not set', () =>
        {
            const style = new TextStyle({});

            const obj = style['_toObject']();

            expect(obj.stroke).toBeUndefined();
        });

        it('should return dropShadow with all properties', () =>
        {
            const style = new TextStyle({
                dropShadow: {
                    alpha: 0.7,
                    angle: 45,
                    blur: 5,
                    color: 0x333333,
                    distance: 10,
                },
            });

            const obj = style['_toObject']();

            expect(obj.dropShadow).toEqual({
                alpha: 0.7,
                angle: 45,
                blur: 5,
                color: 0x333333,
                distance: 10,
            });
        });

        it('should return null dropShadow when not set', () =>
        {
            const style = new TextStyle({ dropShadow: null });

            const obj = style['_toObject']();

            expect(obj.dropShadow).toBeNull();
        });

        it('should return filters array', () =>
        {
            const filter = new BlurFilter();
            const style = new TextStyle({ filters: [filter] });

            const obj = style['_toObject']();

            expect(obj.filters).toHaveLength(1);
            expect(obj.filters[0]).toBe(filter);
        });

        it('should return undefined filters when not set', () =>
        {
            const style = new TextStyle({});

            const obj = style['_toObject']();

            expect(obj.filters).toBeUndefined();
        });

        it('should return tagStyles object', () =>
        {
            const style = new TextStyle({
                tagStyles: {
                    red: { fill: 0xff0000 },
                    bold: { fontWeight: 'bold' },
                },
            });

            const obj = style['_toObject']();

            expect(obj.tagStyles).toEqual({
                red: { fill: 0xff0000 },
                bold: { fontWeight: 'bold' },
            });
        });

        it('should return undefined tagStyles when not set', () =>
        {
            const style = new TextStyle({});

            const obj = style['_toObject']();

            expect(obj.tagStyles).toBeUndefined();
        });

        it('should return independent dropShadow copy', () =>
        {
            const style = new TextStyle({
                dropShadow: { alpha: 0.5, angle: 0, blur: 4, color: 0x000000, distance: 5 },
            });

            const obj = style['_toObject']();
            const dropShadow = obj.dropShadow as { blur: number };

            dropShadow.blur = 20;

            expect(style.dropShadow.blur).toBe(4);
        });

        it('should return independent stroke copy', () =>
        {
            const style = new TextStyle({
                stroke: { color: 0x00ff00, width: 2 },
            });

            const obj = style['_toObject']();

            (obj.stroke as StrokeStyle).width = 10;

            expect(style._stroke.width).toBe(2);
        });

        it('should return independent tagStyles copy', () =>
        {
            const style = new TextStyle({
                tagStyles: { red: { fill: 0xff0000 } },
            });

            const obj = style['_toObject']();

            obj.tagStyles.blue = { fill: 0x0000ff };

            expect(style.tagStyles.blue).toBeUndefined();
        });
    });
});
