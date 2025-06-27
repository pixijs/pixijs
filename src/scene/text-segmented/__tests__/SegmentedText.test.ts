import { Text } from '../../text/Text';
import { TextStyle } from '../../text/TextStyle';
import { BitmapText } from '../../text-bitmap/BitmapText';
import { SegmentedBitmapText } from '../SegmentedBitmapText';
import { SegmentedText } from '../SegmentedText';

describe('SegmentedText', () =>
{
    describe('constructor', () =>
    {
        it('should create instance with default options', () =>
        {
            const text = new SegmentedText({
                text: 'Hello',
                style: { fontSize: 24 },
            });

            expect(text.text).toBe('Hello');
            expect(text.chars).toBeInstanceOf(Array);
            expect(text.words).toBeInstanceOf(Array);
            expect(text.lines).toBeInstanceOf(Array);
            expect(text.style).toBeInstanceOf(TextStyle);
        });

        it('should respect custom options', () =>
        {
            const text = new SegmentedText({
                text: 'Hello',
                style: { fontSize: 24 },

                autoSegment: false,
                lineAnchor: 0.5,
                wordAnchor: { x: 0, y: 1 },
                charAnchor: { x: 0.5, y: 0.5 },
            });

            expect(text.lineAnchor).toEqual(0.5);
            expect(text.wordAnchor).toEqual({ x: 0, y: 1 });
            expect(text.charAnchor).toEqual({ x: 0.5, y: 0.5 });
        });
    });

    describe('static from()', () =>
    {
        it('should create from Text instance', () =>
        {
            const sourceText = new Text({
                text: 'Convert me',
                style: { fontSize: 24 },
            });

            const segmented = SegmentedText.from(sourceText, {
                lineAnchor: 0.5,
            });

            expect(segmented).toBeInstanceOf(SegmentedText);
            expect(segmented.text).toBe('Convert me');
            expect(segmented.lineAnchor).toEqual(0.5);
        });

        it('should create from BitmapText instance', () =>
        {
            const bitmapText = new BitmapText({
                text: 'Bitmap',
                style: { fontFamily: 'Arial' },
            });

            const segmented = SegmentedBitmapText.from(bitmapText);

            expect(segmented).toBeInstanceOf(SegmentedBitmapText);
            expect(segmented.text).toBe('Bitmap');
        });
    });

    describe('segmentation', () =>
    {
        it('should segment text into chars, words, and lines', () =>
        {
            const text = new SegmentedText({
                text: 'Hello World',
                style: { fontSize: 24 },
            });

            expect(text.chars.length).toBeGreaterThan(0);
            expect(text.words.length).toBe(2);
            expect(text.lines.length).toBe(1);
        });

        it('should handle multi-line text', () =>
        {
            const text = new SegmentedText({
                text: 'Hello\nWorld',
                style: { fontSize: 24 },
            });

            expect(text.lines.length).toBe(2);
        });

        it('should respect text alignment', () =>
        {
            const text = new SegmentedBitmapText({
                text: 'Right\nAligned',
                style: {
                    align: 'right',
                },
            });

            const firstWord = text.words[0];

            expect(firstWord.x).not.toBe(0); // Should be offset for right alignment
            expect(text.lines.length).toBe(2);
            expect(text.words.length).toBe(2);
            expect(text.chars.length).toBe(12); // 'Right' + 'Aligned'
        });

        it('should respect autoSegment option', () =>
        {
            const text = new SegmentedText({
                text: 'Hello',
                style: { fontSize: 24 },
                autoSegment: false,
            });

            expect(text.chars.length).toBe(0); // No segmentation done
            text.segment();
            expect(text.chars.length).toBe(5); // Now segmented

            text.text = 'Changed';
            expect(text.chars.length).toBe(0); // Should not auto-segment

            text.segment();
            expect(text.chars[0].text).toBe('C'); // Now updated
        });
    });

    describe('transform origins', () =>
    {
        it('should set numeric origins', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },
            });

            text.lineAnchor = 0.5;
            expect(text.lineAnchor).toEqual(0.5);

            text.wordAnchor = 0.5;
            expect(text.wordAnchor).toEqual(0.5);

            text.charAnchor = 0.5;
            expect(text.charAnchor).toEqual(0.5);
        });

        it('should set point origins', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },
            });

            const point = { x: 0.5, y: 1 };

            text.lineAnchor = point;
            expect(text.lineAnchor).toEqual(point);
        });

        it('should update origins after text changes', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },

                charAnchor: 0.5,
            });

            const originalOrigin = text.chars[0].origin.x;

            text.text = 'New';

            expect(text.chars[0].origin.x).not.toBe(originalOrigin);
        });
    });

    describe('style updates', () =>
    {
        it('should update style properties', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },
            });

            text.style = { fontSize: 48 };
            expect(text.style.fontSize).toBe(48);
        });

        it('should trigger segmentation on style change', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },
            });

            const char = text.chars[0];
            const originalBounds = char.getBounds();

            text.style = { fontSize: 48 };

            const newChar = text.chars[0];
            const newBounds = newChar.getBounds();

            expect(newBounds.height).toBeGreaterThan(originalBounds.height);
        });
    });

    describe('destroy', () =>
    {
        it('should clean up resources', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },
            });

            text.destroy({ children: true, texture: true, style: true });

            expect(text.chars).toEqual([]);
            expect(text.words).toEqual([]);
            expect(text.lines).toEqual([]);
            expect(text.style).toBeNull();
        });

        it('should handle partial cleanup', () =>
        {
            const text = new SegmentedText({
                text: 'Test',
                style: { fontSize: 24 },
            });

            const style = text.style;

            text.destroy({ children: true, style: false });

            expect(text.chars).toEqual([]);
            expect(style).not.toBeNull();
        });
    });
});
