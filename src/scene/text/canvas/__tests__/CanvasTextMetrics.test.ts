import '~/environment-browser/browserAll';
import { TextStyle } from '../../TextStyle';
import { CanvasTextMetrics } from '../CanvasTextMetrics';

describe('CanvasTextMetrics', () =>
{
    beforeEach(() =>
    {
        // Clear font metrics cache before each test
        CanvasTextMetrics.clearMetrics();
    });

    describe('constructor', () =>
    {
        it('should create instance with all provided values', () =>
        {
            const style = new TextStyle({ fontSize: 24 });
            const fontProps = { ascent: 20, descent: 5, fontSize: 25 };

            const metrics = new CanvasTextMetrics(
                'test text',
                style,
                100,
                50,
                ['line1', 'line2'],
                [80, 60],
                30,
                80,
                fontProps
            );

            expect(metrics.text).toBe('test text');
            expect(metrics.style).toBe(style);
            expect(metrics.width).toBe(100);
            expect(metrics.height).toBe(50);
            expect(metrics.lines).toEqual(['line1', 'line2']);
            expect(metrics.lineWidths).toEqual([80, 60]);
            expect(metrics.lineHeight).toBe(30);
            expect(metrics.maxLineWidth).toBe(80);
            expect(metrics.fontProperties).toBe(fontProps);
        });

        it('should handle tagged data when provided', () =>
        {
            const style = new TextStyle({ fontSize: 24 });
            const fontProps = { ascent: 20, descent: 5, fontSize: 25 };
            const taggedData = {
                runsByLine: [[{ text: 'test', style }]],
                lineAscents: [20],
                lineDescents: [5],
                lineHeights: [30],
            };

            const metrics = new CanvasTextMetrics(
                'test',
                style,
                100,
                50,
                ['test'],
                [100],
                30,
                100,
                fontProps,
                taggedData
            );

            expect(metrics.runsByLine).toBe(taggedData.runsByLine);
            expect(metrics.lineAscents).toBe(taggedData.lineAscents);
            expect(metrics.lineDescents).toBe(taggedData.lineDescents);
            expect(metrics.lineHeights).toBe(taggedData.lineHeights);
        });

        it('should not set tagged properties when taggedData is not provided', () =>
        {
            const style = new TextStyle({ fontSize: 24 });
            const fontProps = { ascent: 20, descent: 5, fontSize: 25 };

            const metrics = new CanvasTextMetrics(
                'test',
                style,
                100,
                50,
                ['test'],
                [100],
                30,
                100,
                fontProps
            );

            expect(metrics.runsByLine).toBeUndefined();
            expect(metrics.lineAscents).toBeUndefined();
            expect(metrics.lineDescents).toBeUndefined();
            expect(metrics.lineHeights).toBeUndefined();
        });
    });

    describe('experimentalLetterSpacingSupported', () =>
    {
        it('should return a boolean on first call', () =>
        {
            CanvasTextMetrics._experimentalLetterSpacingSupported = undefined as any;

            const result = CanvasTextMetrics.experimentalLetterSpacingSupported;

            expect(typeof result).toBe('boolean');
            expect(typeof CanvasTextMetrics._experimentalLetterSpacingSupported).toBe('boolean');
            expect(CanvasTextMetrics._experimentalLetterSpacingSupported).toBe(result);
        });

        it('should return cached value on subsequent calls', () =>
        {
            CanvasTextMetrics._experimentalLetterSpacingSupported = undefined as any;

            const result1 = CanvasTextMetrics.experimentalLetterSpacingSupported;
            const result2 = CanvasTextMetrics.experimentalLetterSpacingSupported;

            expect(result1).toBe(result2);
        });
    });

    describe('measureText', () =>
    {
        it('should measure basic text', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('Hello', style);

            expect(metrics.text).toBe('Hello');
            expect(metrics.width).toBeGreaterThan(0);
            expect(metrics.height).toBeGreaterThan(0);
            expect(metrics.lines.length).toBe(1);
            expect(metrics.lines[0]).toBe('Hello');
        });

        it('should measure single space', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText(' ', style);

            expect(metrics.text).toBe(' ');
            expect(metrics.width).toBeGreaterThan(0);
            expect(metrics.lines.length).toBe(1);
            expect(metrics.lines[0]).toBe(' ');
        });

        it('should handle multiline text with \\n', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('Line 1\nLine 2\nLine 3', style);

            expect(metrics.lines.length).toBe(3);
            expect(metrics.lines[0]).toBe('Line 1');
            expect(metrics.lines[1]).toBe('Line 2');
            expect(metrics.lines[2]).toBe('Line 3');
        });

        it('should handle multiline text with \\r\\n', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('Line 1\r\nLine 2', style);

            expect(metrics.lines.length).toBe(2);
        });

        it('should handle multiline text with \\r', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('Line 1\rLine 2', style);

            expect(metrics.lines.length).toBe(2);
        });

        it('should use lineHeight from style when specified', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial', lineHeight: 50 });
            const metrics = CanvasTextMetrics.measureText('Hello', style);

            expect(metrics.lineHeight).toBe(50);
        });

        it('should calculate maxLineWidth correctly', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('Short\nLonger text here\nMid', style);

            expect(metrics.maxLineWidth).toBe(Math.max(...metrics.lineWidths));
        });

        it('should cache measurement results', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });

            const metrics1 = CanvasTextMetrics.measureText('Hello', style);
            const metrics2 = CanvasTextMetrics.measureText('Hello', style);

            expect(metrics1).toBe(metrics2);
        });

        it('should return different cache entries for different text', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });

            const metrics1 = CanvasTextMetrics.measureText('Hello', style);
            const metrics2 = CanvasTextMetrics.measureText('World', style);

            expect(metrics1).not.toBe(metrics2);
        });

        it('should handle leading in height calculation', () =>
        {
            const baseStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', leading: 0 });
            const leadingStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', leading: 10 });

            const baseMetrics = CanvasTextMetrics.measureText('Line 1\nLine 2', baseStyle);
            const leadingMetrics = CanvasTextMetrics.measureText('Line 1\nLine 2', leadingStyle);

            expect(leadingMetrics.height).toBeGreaterThan(baseMetrics.height);
        });
    });

    describe('measureText with wordWrap', () =>
    {
        it('should wrap text when wordWrap is enabled', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100
            });
            const metrics = CanvasTextMetrics.measureText('This is a longer text that should wrap', style);

            expect(metrics.lines.length).toBeGreaterThan(1);
        });

        it('should not wrap text when wordWrap is false', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: false,
                wordWrapWidth: 50
            });
            const metrics = CanvasTextMetrics.measureText('This is a longer text', style);

            expect(metrics.lines.length).toBe(1);
        });

        it('should respect wordWrapWidth parameter', () =>
        {
            const narrowStyle = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 80
            });
            const wideStyle = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 400
            });

            const narrowMetrics = CanvasTextMetrics.measureText('This is a test sentence', narrowStyle);
            const wideMetrics = CanvasTextMetrics.measureText('This is a test sentence', wideStyle);

            expect(narrowMetrics.lines.length).toBeGreaterThan(wideMetrics.lines.length);
        });

        it('should break words when breakWords is true', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 80,
                breakWords: true
            });
            const metrics = CanvasTextMetrics.measureText('Supercalifragilisticexpialidocious', style);

            expect(metrics.lines.length).toBeGreaterThan(1);
        });

        it('should not break words when breakWords is false', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 80,
                breakWords: false
            });
            const metrics = CanvasTextMetrics.measureText('Supercalifragilisticexpialidocious', style);

            // The word should be on its own line without breaking
            expect(metrics.lines.some((line) => line.includes('Supercalifragilisticexpialidocious'))).toBe(true);
        });

        it('should handle whiteSpace normal mode', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 500,
                whiteSpace: 'normal'
            });
            const metrics = CanvasTextMetrics.measureText('Hello   World\n\nNew Line', style);

            // Spaces and newlines should be collapsed
            expect(metrics.lines.length).toBe(1);
        });

        it('should handle whiteSpace pre mode', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 500,
                whiteSpace: 'pre'
            });
            const metrics = CanvasTextMetrics.measureText('Hello\nWorld', style);

            // Newlines should be preserved
            expect(metrics.lines.length).toBe(2);
        });

        it('should handle whiteSpace pre-line mode', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 500,
                whiteSpace: 'pre-line'
            });
            const metrics = CanvasTextMetrics.measureText('Hello\nWorld', style);

            // Newlines preserved, spaces collapsed
            expect(metrics.lines.length).toBe(2);
        });

        it('should use wordWrapWidth for width with center alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'center'
            });
            const metrics = CanvasTextMetrics.measureText('Hi', style);

            expect(metrics.width).toBeGreaterThanOrEqual(300);
        });

        it('should use wordWrapWidth for width with right alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'right'
            });
            const metrics = CanvasTextMetrics.measureText('Hi', style);

            expect(metrics.width).toBeGreaterThanOrEqual(300);
        });

        it('should use maxLineWidth for width with left alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'left'
            });
            const metrics = CanvasTextMetrics.measureText('Hi', style);

            expect(metrics.width).toBeLessThan(300);
        });

        it('should use maxLineWidth for width with justify alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'justify'
            });
            const metrics = CanvasTextMetrics.measureText('Hi', style);

            expect(metrics.width).toBeLessThan(300);
        });
    });

    describe('measureText with stroke', () =>
    {
        it('should include stroke width in dimensions', () =>
        {
            const plainStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const strokeStyle = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                stroke: { color: 'black', width: 4 }
            });

            const plainMetrics = CanvasTextMetrics.measureText('Hello', plainStyle);
            const strokeMetrics = CanvasTextMetrics.measureText('Hello', strokeStyle);

            expect(strokeMetrics.width).toBeGreaterThan(plainMetrics.width);
        });
    });

    describe('measureText with dropShadow', () =>
    {
        it('should include drop shadow distance in dimensions', () =>
        {
            const plainStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const shadowStyle = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                dropShadow: { distance: 10, color: 'black', blur: 0, angle: 0, alpha: 1 }
            });

            const plainMetrics = CanvasTextMetrics.measureText('Hello', plainStyle);
            const shadowMetrics = CanvasTextMetrics.measureText('Hello', shadowStyle);

            expect(shadowMetrics.width).toBeGreaterThan(plainMetrics.width);
            expect(shadowMetrics.height).toBeGreaterThan(plainMetrics.height);
        });
    });

    describe('measureText with letterSpacing', () =>
    {
        it('should account for letter spacing in width', () =>
        {
            const plainStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', letterSpacing: 0 });
            const spacedStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', letterSpacing: 5 });

            const plainMetrics = CanvasTextMetrics.measureText('Hello', plainStyle);
            const spacedMetrics = CanvasTextMetrics.measureText('Hello', spacedStyle);

            expect(spacedMetrics.width).toBeGreaterThan(plainMetrics.width);
        });
    });

    describe('measureFont', () =>
    {
        it('should return font metrics', () =>
        {
            const metrics = CanvasTextMetrics.measureFont('24px Arial');

            expect(metrics).toHaveProperty('ascent');
            expect(metrics).toHaveProperty('descent');
            expect(metrics).toHaveProperty('fontSize');
            expect(typeof metrics.ascent).toBe('number');
            expect(typeof metrics.descent).toBe('number');
            expect(typeof metrics.fontSize).toBe('number');
        });

        it('should cache font metrics', () =>
        {
            const metrics1 = CanvasTextMetrics.measureFont('24px Arial');
            const metrics2 = CanvasTextMetrics.measureFont('24px Arial');

            expect(metrics1).toBe(metrics2);
        });

        it('should return different metrics for different fonts', () =>
        {
            const arialMetrics = CanvasTextMetrics.measureFont('24px Arial');
            const timesMetrics = CanvasTextMetrics.measureFont('24px Times New Roman');

            // They may have same values but should be different cached objects
            expect(arialMetrics).not.toBe(timesMetrics);
        });

        it('should return different metrics for different sizes', () =>
        {
            const small = CanvasTextMetrics.measureFont('12px Arial');
            const large = CanvasTextMetrics.measureFont('48px Arial');

            expect(large.fontSize).toBeGreaterThan(small.fontSize);
        });
    });

    describe('clearMetrics', () =>
    {
        it('should clear all cached font metrics', () =>
        {
            const metrics1 = CanvasTextMetrics.measureFont('24px Arial');

            CanvasTextMetrics.clearMetrics();

            const metrics2 = CanvasTextMetrics.measureFont('24px Arial');

            expect(metrics1).not.toBe(metrics2);
        });

        it('should clear specific font when font name provided', () =>
        {
            const arial = CanvasTextMetrics.measureFont('24px Arial');
            const times = CanvasTextMetrics.measureFont('24px Times New Roman');

            CanvasTextMetrics.clearMetrics('24px Arial');

            const newArial = CanvasTextMetrics.measureFont('24px Arial');
            const sameTimes = CanvasTextMetrics.measureFont('24px Times New Roman');

            expect(arial).not.toBe(newArial);
            expect(times).toBe(sameTimes);
        });
    });

    describe('isBreakingSpace', () =>
    {
        it('should return true for regular space', () =>
        {
            expect(CanvasTextMetrics.isBreakingSpace(' ')).toBe(true);
        });

        it('should return true for tab', () =>
        {
            expect(CanvasTextMetrics.isBreakingSpace('\t')).toBe(true);
        });

        it('should return false for regular characters', () =>
        {
            expect(CanvasTextMetrics.isBreakingSpace('a')).toBe(false);
            expect(CanvasTextMetrics.isBreakingSpace('Z')).toBe(false);
            expect(CanvasTextMetrics.isBreakingSpace('1')).toBe(false);
        });

        it('should return false for non-string input', () =>
        {
            expect(CanvasTextMetrics.isBreakingSpace(null as any)).toBe(false);
            expect(CanvasTextMetrics.isBreakingSpace(undefined as any)).toBe(false);
            expect(CanvasTextMetrics.isBreakingSpace(123 as any)).toBe(false);
        });

        it('should return true for various Unicode spaces', () =>
        {
            // en space
            expect(CanvasTextMetrics.isBreakingSpace('\u2002')).toBe(true);
            // em space
            expect(CanvasTextMetrics.isBreakingSpace('\u2003')).toBe(true);
            // thin space
            expect(CanvasTextMetrics.isBreakingSpace('\u2009')).toBe(true);
        });
    });

    describe('canBreakWords', () =>
    {
        it('should return the breakWords parameter value', () =>
        {
            expect(CanvasTextMetrics.canBreakWords('test', true)).toBe(true);
            expect(CanvasTextMetrics.canBreakWords('test', false)).toBe(false);
        });

        it('should not depend on the token value', () =>
        {
            expect(CanvasTextMetrics.canBreakWords('short', true)).toBe(true);
            expect(CanvasTextMetrics.canBreakWords('longerword', true)).toBe(true);
            expect(CanvasTextMetrics.canBreakWords('', true)).toBe(true);
        });
    });

    describe('canBreakChars', () =>
    {
        it('should always return true by default', () =>
        {
            expect(CanvasTextMetrics.canBreakChars('a', 'b', 'test', 0, true)).toBe(true);
            expect(CanvasTextMetrics.canBreakChars('x', 'y', 'xyz', 1, false)).toBe(true);
        });
    });

    describe('wordWrapSplit', () =>
    {
        it('should split token into characters', () =>
        {
            const result = CanvasTextMetrics.wordWrapSplit('hello');

            expect(result).toEqual(['h', 'e', 'l', 'l', 'o']);
        });

        it('should handle empty string', () =>
        {
            const result = CanvasTextMetrics.wordWrapSplit('');

            expect(result).toEqual([]);
        });

        it('should handle single character', () =>
        {
            const result = CanvasTextMetrics.wordWrapSplit('a');

            expect(result).toEqual(['a']);
        });
    });

    describe('graphemeSegmenter', () =>
    {
        it('should segment basic text into characters', () =>
        {
            const result = CanvasTextMetrics.graphemeSegmenter('abc');

            expect(result).toEqual(['a', 'b', 'c']);
        });

        it('should handle empty string', () =>
        {
            const result = CanvasTextMetrics.graphemeSegmenter('');

            expect(result).toEqual([]);
        });

        it('should handle single character', () =>
        {
            const result = CanvasTextMetrics.graphemeSegmenter('x');

            expect(result).toEqual(['x']);
        });
    });

    describe('_canvas', () =>
    {
        it('should return a canvas element', () =>
        {
            const canvas = CanvasTextMetrics._canvas;

            expect(canvas).toBeDefined();
            expect(typeof canvas.getContext).toBe('function');
        });

        it('should return the same canvas on multiple accesses', () =>
        {
            const canvas1 = CanvasTextMetrics._canvas;
            const canvas2 = CanvasTextMetrics._canvas;

            expect(canvas1).toBe(canvas2);
        });
    });

    describe('_context', () =>
    {
        it('should return a 2d rendering context', () =>
        {
            const context = CanvasTextMetrics._context;

            expect(context).toBeDefined();
            expect(typeof context.measureText).toBe('function');
        });

        it('should return the same context on multiple accesses', () =>
        {
            const context1 = CanvasTextMetrics._context;
            const context2 = CanvasTextMetrics._context;

            expect(context1).toBe(context2);
        });
    });

    describe('static properties', () =>
    {
        it('should have METRICS_STRING defined', () =>
        {
            expect(CanvasTextMetrics.METRICS_STRING).toBeDefined();
            expect(typeof CanvasTextMetrics.METRICS_STRING).toBe('string');
        });

        it('should have BASELINE_SYMBOL defined', () =>
        {
            expect(CanvasTextMetrics.BASELINE_SYMBOL).toBeDefined();
            expect(typeof CanvasTextMetrics.BASELINE_SYMBOL).toBe('string');
        });

        it('should have BASELINE_MULTIPLIER defined', () =>
        {
            expect(CanvasTextMetrics.BASELINE_MULTIPLIER).toBeDefined();
            expect(typeof CanvasTextMetrics.BASELINE_MULTIPLIER).toBe('number');
        });

        it('should have HEIGHT_MULTIPLIER defined', () =>
        {
            expect(CanvasTextMetrics.HEIGHT_MULTIPLIER).toBeDefined();
            expect(typeof CanvasTextMetrics.HEIGHT_MULTIPLIER).toBe('number');
        });

        it('should have experimentalLetterSpacing property', () =>
        {
            expect(typeof CanvasTextMetrics.experimentalLetterSpacing).toBe('boolean');
        });
    });

    describe('edge cases', () =>
    {
        it('should handle text with only spaces', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('   ', style);

            expect(metrics).toBeDefined();
            expect(metrics.lines.length).toBe(1);
        });

        it('should handle text with only newlines', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('\n\n\n', style);

            expect(metrics).toBeDefined();
            expect(metrics.lines.length).toBe(4);
        });

        it('should handle Unicode characters', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('こんにちは', style);

            expect(metrics).toBeDefined();
            expect(metrics.width).toBeGreaterThan(0);
        });

        it('should handle emoji characters', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('😀🎉', style);

            expect(metrics).toBeDefined();
            expect(metrics.width).toBeGreaterThan(0);
        });

        it('should handle very long single word', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100
            });
            const longWord = 'a'.repeat(100);
            const metrics = CanvasTextMetrics.measureText(longWord, style);

            expect(metrics).toBeDefined();
        });

        it('should handle special characters', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('!@#$%^&*()_+-=[]{}|;:,.<>?', style);

            expect(metrics).toBeDefined();
            expect(metrics.width).toBeGreaterThan(0);
        });

        it('should handle mixed content with numbers and letters', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('ABC123abc', style);

            expect(metrics).toBeDefined();
            expect(metrics.width).toBeGreaterThan(0);
        });
    });

    describe('wordWrap parameter override', () =>
    {
        it('should allow overriding wordWrap via parameter', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: false,
                wordWrapWidth: 100
            });

            // Override wordWrap to true via parameter
            const metrics = CanvasTextMetrics.measureText('This is a longer text that should wrap', style, undefined, true);

            expect(metrics.lines.length).toBeGreaterThan(1);
        });

        it('should allow disabling wordWrap via parameter', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100
            });

            // Override wordWrap to false via parameter
            const metrics = CanvasTextMetrics.measureText('This is a longer text', style, undefined, false);

            expect(metrics.lines.length).toBe(1);
        });
    });

    describe('measureText with font properties', () =>
    {
        it('should handle different font sizes', () =>
        {
            const smallStyle = new TextStyle({ fontSize: 12, fontFamily: 'Arial' });
            const largeStyle = new TextStyle({ fontSize: 48, fontFamily: 'Arial' });

            const smallMetrics = CanvasTextMetrics.measureText('Hello', smallStyle);
            const largeMetrics = CanvasTextMetrics.measureText('Hello', largeStyle);

            expect(largeMetrics.width).toBeGreaterThan(smallMetrics.width);
            expect(largeMetrics.height).toBeGreaterThan(smallMetrics.height);
        });

        it('should handle different font families', () =>
        {
            const arialStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const timesStyle = new TextStyle({ fontSize: 24, fontFamily: 'Times New Roman' });

            const arialMetrics = CanvasTextMetrics.measureText('Hello', arialStyle);
            const timesMetrics = CanvasTextMetrics.measureText('Hello', timesStyle);

            // Different fonts should produce different widths
            expect(arialMetrics.width).not.toBe(timesMetrics.width);
        });

        it('should handle font family array', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: ['Arial', 'Helvetica', 'sans-serif']
            });
            const metrics = CanvasTextMetrics.measureText('Hello', style);

            expect(metrics.width).toBeGreaterThan(0);
        });

        it('should handle bold font weight', () =>
        {
            const normalStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontWeight: 'normal' });
            const boldStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold' });

            const normalMetrics = CanvasTextMetrics.measureText('Hello', normalStyle);
            const boldMetrics = CanvasTextMetrics.measureText('Hello', boldStyle);

            // Bold text is typically wider
            expect(boldMetrics.width).toBeGreaterThan(normalMetrics.width);
        });

        it('should handle numeric font weights', () =>
        {
            const light = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontWeight: '300' });
            const heavy = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontWeight: '900' });

            const lightMetrics = CanvasTextMetrics.measureText('Hello', light);
            const heavyMetrics = CanvasTextMetrics.measureText('Hello', heavy);

            expect(lightMetrics).toBeDefined();
            expect(heavyMetrics).toBeDefined();
        });

        it('should handle italic font style', () =>
        {
            const normalStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontStyle: 'normal' });
            const italicStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontStyle: 'italic' });

            const normalMetrics = CanvasTextMetrics.measureText('Hello', normalStyle);
            const italicMetrics = CanvasTextMetrics.measureText('Hello', italicStyle);

            expect(normalMetrics).toBeDefined();
            expect(italicMetrics).toBeDefined();
        });

        it('should handle oblique font style', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontStyle: 'oblique' });
            const metrics = CanvasTextMetrics.measureText('Hello', style);

            expect(metrics).toBeDefined();
            expect(metrics.width).toBeGreaterThan(0);
        });

        it('should handle small-caps font variant', () =>
        {
            const normalStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontVariant: 'normal' });
            const smallCapsStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', fontVariant: 'small-caps' });

            const normalMetrics = CanvasTextMetrics.measureText('Hello', normalStyle);
            const smallCapsMetrics = CanvasTextMetrics.measureText('Hello', smallCapsStyle);

            expect(normalMetrics).toBeDefined();
            expect(smallCapsMetrics).toBeDefined();
        });

        it('should handle combined font properties', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'italic',
                fontVariant: 'small-caps'
            });
            const metrics = CanvasTextMetrics.measureText('Hello', style);

            expect(metrics).toBeDefined();
            expect(metrics.width).toBeGreaterThan(0);
        });
    });

    describe('measureText alignment without wordWrap', () =>
    {
        it('should measure left-aligned text without wordWrap', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: false,
                align: 'left'
            });
            const metrics = CanvasTextMetrics.measureText('Hello\nWorld', style);

            expect(metrics.lines.length).toBe(2);
            expect(metrics.lineWidths.length).toBe(2);
        });

        it('should measure center-aligned text without wordWrap', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: false,
                align: 'center'
            });
            const metrics = CanvasTextMetrics.measureText('Hello\nWorld', style);

            expect(metrics.lines.length).toBe(2);
        });

        it('should measure right-aligned text without wordWrap', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: false,
                align: 'right'
            });
            const metrics = CanvasTextMetrics.measureText('Hello\nWorld', style);

            expect(metrics.lines.length).toBe(2);
        });

        it('should have per-line widths for multiline text', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const metrics = CanvasTextMetrics.measureText('Hi\nLonger line\nMed', style);

            expect(metrics.lineWidths.length).toBe(3);
            // "Longer line" should be wider than "Hi"
            expect(metrics.lineWidths[1]).toBeGreaterThan(metrics.lineWidths[0]);
        });
    });

    describe('measureText with multiple style properties', () =>
    {
        it('should handle stroke with different widths', () =>
        {
            const thin = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                stroke: { color: 'black', width: 1 }
            });
            const thick = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                stroke: { color: 'black', width: 8 }
            });

            const thinMetrics = CanvasTextMetrics.measureText('Hello', thin);
            const thickMetrics = CanvasTextMetrics.measureText('Hello', thick);

            expect(thickMetrics.width).toBeGreaterThan(thinMetrics.width);
        });

        it('should handle drop shadow with different distances', () =>
        {
            const close = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                dropShadow: { distance: 2, color: 'black', blur: 0, angle: 0, alpha: 1 }
            });
            const far = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                dropShadow: { distance: 20, color: 'black', blur: 0, angle: 0, alpha: 1 }
            });

            const closeMetrics = CanvasTextMetrics.measureText('Hello', close);
            const farMetrics = CanvasTextMetrics.measureText('Hello', far);

            expect(farMetrics.width).toBeGreaterThan(closeMetrics.width);
            expect(farMetrics.height).toBeGreaterThan(closeMetrics.height);
        });

        it('should handle combined stroke and dropShadow', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                stroke: { color: 'black', width: 4 },
                dropShadow: { distance: 5, color: 'black', blur: 0, angle: 0, alpha: 1 }
            });
            const plainStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });

            const styledMetrics = CanvasTextMetrics.measureText('Hello', style);
            const plainMetrics = CanvasTextMetrics.measureText('Hello', plainStyle);

            expect(styledMetrics.width).toBeGreaterThan(plainMetrics.width);
            expect(styledMetrics.height).toBeGreaterThan(plainMetrics.height);
        });

        it('should handle negative letter spacing', () =>
        {
            const positiveStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', letterSpacing: 5 });
            const negativeStyle = new TextStyle({ fontSize: 24, fontFamily: 'Arial', letterSpacing: -2 });

            const positiveMetrics = CanvasTextMetrics.measureText('Hello', positiveStyle);
            const negativeMetrics = CanvasTextMetrics.measureText('Hello', negativeStyle);

            expect(positiveMetrics.width).toBeGreaterThan(negativeMetrics.width);
        });
    });
});
