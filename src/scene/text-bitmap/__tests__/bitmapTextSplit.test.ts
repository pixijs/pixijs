import '~/rendering/init';
import '~/scene/text-bitmap/init';
import { BitmapText } from '../BitmapText';
import { Container } from '~/scene/container/Container';
import { TextStyle } from '~/scene/text/TextStyle';

describe('BitmapText.split', () =>
{
    let mockText: BitmapText;
    let mockStyle: TextStyle;

    beforeEach(() =>
    {
        mockStyle = new TextStyle({
            fontSize: 16,
            align: 'left',
        });

        mockText = new BitmapText({
            text: 'Hello World',
            style: mockStyle,
        });
    });

    it('should split direct Text instance', () =>
    {
        const result = BitmapText.split(mockText);

        expect(result.container).toBeInstanceOf(Container);
        expect(result.chars.length).toBe(10);
        expect(result.words.length).toBe(2);
        expect(result.lines.length).toBe(1);
    });

    it('should split with ExistingTextSplitConfig', () =>
    {
        const parent = new Container();

        parent.addChild(mockText);
        const config = {
            text: mockText,
            replace: true,
        };

        const result = BitmapText.split(config);

        expect(result.container).toBeInstanceOf(Container);
        expect(result.words.length).toBe(2);
        expect(result.chars.length).toBe(10);
        expect(result.lines.length).toBe(1);
        expect(mockText.parent).toBe(null);
        expect(result.container.parent).toBe(parent);
    });

    it('should split with RawTextSplitConfig', () =>
    {
        const config = {
            string: 'Hello\nWorld',
            style: mockStyle,
        };

        const result = BitmapText.split(config);

        expect(result.container).toBeInstanceOf(Container);
        expect(result.lines.length).toBe(2);
        expect(result.chars.length).toBe(10);
        expect(result.words.length).toBe(2);
    });

    it('should handle empty text', () =>
    {
        const emptyText = new BitmapText({ text: '', style: mockStyle });
        const result = BitmapText.split(emptyText);

        expect(result.container).toBeInstanceOf(Container);
        expect(result.chars.length).toBe(0);
        expect(result.words.length).toBe(0);
        expect(result.lines.length).toBe(0);
    });

    it('should respect text alignment', () =>
    {
        const alignedStyle = mockStyle.clone();

        alignedStyle.align = 'right';

        const text = new BitmapText({
            text: 'Right\nAligned',
            style: alignedStyle,
        });

        const result = BitmapText.split(text);
        const firstWord = result.words[0];

        expect(firstWord.x).not.toBe(0); // Should be offset for right alignment
        expect(result.lines.length).toBe(2);
        expect(result.words.length).toBe(2);
        expect(result.chars.length).toBe(12); // 'Right' + 'Aligned'
    });

    it('should handle multiline text', () =>
    {
        const multilineText = new BitmapText({
            text: 'Line 1\nLine 2\nLine 3',
            style: mockStyle,
        });

        const result = BitmapText.split(multilineText);

        expect(result.lines.length).toBe(3);
        expect(result.lines[1].y).toBeGreaterThan(result.lines[0].y);
        expect(result.lines[2].y).toBeGreaterThan(result.lines[1].y);
    });

    it('should preserve text style properties', () =>
    {
        const styledText = new BitmapText({
            text: 'Styled',
            style: new TextStyle({
                fontSize: 24,
                fill: '#ff0000',
                fontWeight: 'bold',
            }),
        });

        const result = BitmapText.split(styledText);
        const firstChar = result.chars[0] as BitmapText;

        expect(firstChar.style.fontSize).toBe(24);
        expect(firstChar.style.fill).toBe('#ff0000');
        expect(firstChar.style.fontWeight).toBe('bold');
    });

    it('should respect the anchor point', () =>
    {
        const anchoredText = new BitmapText({
            text: 'Anchored',
            style: mockStyle,
            anchor: { x: 0.5, y: 0.5 }, // Center anchor
        });

        const result = BitmapText.split(anchoredText);
        const firstChar = result.chars[0] as BitmapText;

        expect(firstChar.anchor.x).toBe(0.5);
        expect(firstChar.anchor.y).toBe(0.5);
    });
});
