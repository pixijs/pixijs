import '~/environment-browser/browserAll';
import { TextStyle } from '../../TextStyle';
import { CanvasTextMetrics } from '../CanvasTextMetrics';

describe('CanvasTextMetrics tagged text', () =>
{
    describe('measureText with tagStyles', () =>
    {
        it('should return standard metrics for plain text', () =>
        {
            const style = new TextStyle({ fontSize: 24, fontFamily: 'Arial' });
            const measured = CanvasTextMetrics.measureText('Hello World', style);

            expect(measured.runsByLine).toBeUndefined();
            expect(measured.lineAscents).toBeUndefined();
            expect(measured.lines.length).toBe(1);
            expect(measured.lines[0]).toBe('Hello World');
        });

        it('should return tagged metrics for tagged text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hello</red>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.runsByLine.length).toBe(1);
            expect(measured.lineAscents).toBeDefined();
            expect(measured.lineDescents).toBeDefined();
            expect(measured.lineHeights).toBeDefined();
        });

        it('should handle multiple lines in tagged text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Line 1</red>\nLine 2', style);

            expect(measured.runsByLine.length).toBe(2);
            expect(measured.lines.length).toBe(2);
            expect(measured.lines[0]).toBe('Line 1');
            expect(measured.lines[1]).toBe('Line 2');
        });

        it('should have larger height for text with larger font sizes', () =>
        {
            const smallStyle = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    big: { fontSize: 48 }
                }
            });

            const plainMeasured = CanvasTextMetrics.measureText('Hello', smallStyle);
            const taggedMeasured = CanvasTextMetrics.measureText('<big>Hello</big>', smallStyle);

            // Tagged text with larger font should be taller
            expect(taggedMeasured.height).toBeGreaterThan(plainMeasured.height);
        });

        it('should have larger width for text with larger font sizes', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    big: { fontSize: 48 }
                }
            });

            const plainMeasured = CanvasTextMetrics.measureText('Hello', style);
            const taggedMeasured = CanvasTextMetrics.measureText('<big>Hello</big>', style);

            // Tagged text with larger font should be wider
            expect(taggedMeasured.width).toBeGreaterThan(plainMeasured.width);
        });

        it('should handle mixed font sizes on same line', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    big: { fontSize: 48 },
                    small: { fontSize: 12 }
                }
            });

            const measured = CanvasTextMetrics.measureText('<small>Small</small> <big>Big</big>', style);

            expect(measured.runsByLine.length).toBe(1);
            expect(measured.runsByLine[0].length).toBe(3); // small, space (base style), big

            // Line ascent should be based on the largest font
            expect(measured.lineAscents[0]).toBeGreaterThan(0);
        });
    });

    describe('word wrap with tagStyles', () =>
    {
        it('should wrap tagged text when wordWrap is enabled', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hello World Foo Bar</red>', style);

            // Should have multiple lines after wrapping
            expect(measured.lines.length).toBeGreaterThan(1);
            expect(measured.runsByLine.length).toBeGreaterThan(1);
        });

        it('should preserve styles across word wrap boundaries', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hello World</red>', style);

            // Each line should have runs with the red style
            for (const lineRuns of measured.runsByLine)
            {
                for (const run of lineRuns)
                {
                    expect(run.style.fill).toBe('red');
                }
            }
        });

        it('should handle mixed styles with word wrap', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 150,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hello</red> <blue>World</blue>', style);

            // Should have at least 1 line
            expect(measured.runsByLine.length).toBeGreaterThan(0);
            // maxLineWidth should not exceed wordWrapWidth (with some tolerance for last word)
            expect(measured.maxLineWidth).toBeLessThanOrEqual(200);
        });

        it('should not wrap when wordWrap is false', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: false,
                wordWrapWidth: 50,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hello World Foo Bar</red>', style);

            // Should have only 1 line when wordWrap is false
            expect(measured.lines.length).toBe(1);
            expect(measured.runsByLine.length).toBe(1);
        });

        it('should handle long words with breakWords option', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 80,
                breakWords: true,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Supercalifragilisticexpialidocious</red>', style);

            // Should break the long word into multiple lines
            expect(measured.lines.length).toBeGreaterThan(1);
        });

        it('should keep adjacent tagged words together when breakWords is false', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300, // Wide enough for the word
                breakWords: false,
                tagStyles: {
                    green: { fill: 'green' },
                },
            });

            const measured = CanvasTextMetrics.measureText('<green>Supercalifragilistic</green>expialidocious', style);

            // Should be a single line since there's no space to wrap on
            expect(measured.lines.length).toBe(1);
            expect(measured.lines[0]).toBe('Supercalifragilisticexpialidocious');
        });

        it('should put adjacent tagged word on own line when too wide and breakWords is false', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100, // Too narrow for the word
                breakWords: false,
                tagStyles: {
                    green: { fill: 'green' },
                },
            });

            const measured = CanvasTextMetrics.measureText('Hi <green>Supercalifragilistic</green>expialidocious', style);

            // "Hi" on first line, the long word on second line (kept together)
            expect(measured.lines.length).toBe(2);
            expect(measured.lines[0]).toBe('Hi');
            expect(measured.lines[1]).toBe('Supercalifragilisticexpialidocious');
        });

        it('should wrap at space boundaries even with adjacent tags and breakWords false', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100,
                breakWords: false,
                tagStyles: {
                    red: { fill: 'red' },
                },
            });

            const measured = CanvasTextMetrics.measureText('<red>Hello</red> World', style);

            // Should wrap at the space
            expect(measured.lines.length).toBe(2);
        });

        it('should break adjacent tagged words at character boundaries when breakWords is true', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100, // Too narrow for the word
                breakWords: true,
                tagStyles: {
                    green: { fill: 'green' },
                },
            });

            const measured = CanvasTextMetrics.measureText('<green>Supercalifragilistic</green>expialidocious', style);

            // Should break into multiple lines
            expect(measured.lines.length).toBeGreaterThan(1);
            // Combined text should be preserved
            expect(measured.lines.join('')).toBe('Supercalifragilisticexpialidocious');
        });

        it('should maintain line metrics across wrapped lines', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 100,
                tagStyles: {
                    big: { fontSize: 48 }
                }
            });
            const measured = CanvasTextMetrics.measureText('<big>Hello World Foo</big>', style);

            // Each line should have the big font metrics
            for (const lineAscent of measured.lineAscents)
            {
                expect(lineAscent).toBeGreaterThan(0);
            }
        });

        it('should use wordWrapWidth for width when using right alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'right',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hi</red>', style);

            // Width should be at least wordWrapWidth for proper alignment
            expect(measured.width).toBeGreaterThanOrEqual(300);
        });

        it('should use wordWrapWidth for width when using center alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'center',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hi</red>', style);

            // Width should be at least wordWrapWidth for proper alignment
            expect(measured.width).toBeGreaterThanOrEqual(300);
        });

        it('should use maxLineWidth for width when using left alignment', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'left',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const measured = CanvasTextMetrics.measureText('<red>Hi</red>', style);

            // Width should be based on content, not wordWrapWidth
            expect(measured.width).toBeLessThan(300);
        });
    });

    describe('caching with tagStyles', () =>
    {
        it('should cache tagged text measurements', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured1 = CanvasTextMetrics.measureText('<red>Hello</red>', style);
            const measured2 = CanvasTextMetrics.measureText('<red>Hello</red>', style);

            expect(measured1).toBe(measured2); // Same cached object
        });

        it('should use different cache key when tagStyles changes', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured1 = CanvasTextMetrics.measureText('<red>Hello</red>', style);

            // Update style (simulating tagStyles change and update() call)
            style.tagStyles = { red: { fill: 'blue' } };
            style.update();

            const measured2 = CanvasTextMetrics.measureText('<red>Hello</red>', style);

            expect(measured1).not.toBe(measured2); // Different cached objects
        });

        it('should use different cache key for different text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured1 = CanvasTextMetrics.measureText('<red>Hello</red>', style);
            const measured2 = CanvasTextMetrics.measureText('<red>World</red>', style);

            expect(measured1).not.toBe(measured2);
        });
    });

    describe('tagStyles with font properties', () =>
    {
        it('should handle tag with bold fontWeight', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    bold: { fontWeight: 'bold' }
                }
            });

            const plainMetrics = CanvasTextMetrics.measureText('Hello', style);
            const boldMetrics = CanvasTextMetrics.measureText('<bold>Hello</bold>', style);

            // Bold text should be wider
            expect(boldMetrics.width).toBeGreaterThan(plainMetrics.width);
        });

        it('should handle tag with italic fontStyle', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    italic: { fontStyle: 'italic' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<italic>Hello</italic>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.width).toBeGreaterThan(0);
        });

        it('should handle tag with different fontFamily', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    mono: { fontFamily: 'Courier New' }
                }
            });

            const arialMetrics = CanvasTextMetrics.measureText('Hello', style);
            const monoMetrics = CanvasTextMetrics.measureText('<mono>Hello</mono>', style);

            // Different fonts should have different widths
            expect(arialMetrics.width).not.toBe(monoMetrics.width);
        });

        it('should handle tag with letterSpacing', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    spaced: { letterSpacing: 10 }
                }
            });

            const normalMetrics = CanvasTextMetrics.measureText('Hello', style);
            const spacedMetrics = CanvasTextMetrics.measureText('<spaced>Hello</spaced>', style);

            expect(spacedMetrics.width).toBeGreaterThan(normalMetrics.width);
        });

        it('should handle tag with stroke', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    outline: { stroke: { color: 'black', width: 4 } }
                }
            });

            const measured = CanvasTextMetrics.measureText('<outline>Hello</outline>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.width).toBeGreaterThan(0);
        });

        it('should handle multiple font properties in one tag', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    fancy: {
                        fontSize: 32,
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                        fill: 'red'
                    }
                }
            });

            const measured = CanvasTextMetrics.measureText('<fancy>Hello</fancy>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.width).toBeGreaterThan(0);
        });
    });

    describe('nested tags', () =>
    {
        it('should handle nested tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' },
                    bold: { fontWeight: 'bold' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red><bold>Hello</bold></red>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.runsByLine.length).toBe(1);
        });

        it('should inherit outer tag styles in nested tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    big: { fontSize: 48 },
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<big><red>Hello</red></big>', style);

            // The nested text should have the big font size
            expect(measured.lineAscents[0]).toBeGreaterThan(0);
        });

        it('should handle deeply nested tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    a: { fill: 'red' },
                    b: { fontWeight: 'bold' },
                    c: { fontStyle: 'italic' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<a><b><c>Hello</c></b></a>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.width).toBeGreaterThan(0);
        });
    });

    describe('mixed tagged and plain text', () =>
    {
        it('should handle plain text before tag', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('Hello <red>World</red>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.runsByLine[0].length).toBe(2); // plain + tagged
        });

        it('should handle plain text after tag', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red>Hello</red> World', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.runsByLine[0].length).toBe(2); // tagged + plain
        });

        it('should handle alternating tagged and plain text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' }
                }
            });

            const measured = CanvasTextMetrics.measureText('A <red>B</red> C <blue>D</blue> E', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.runsByLine[0].length).toBeGreaterThanOrEqual(5);
        });

        it('should handle adjacent tags without space', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red>Hello</red><blue>World</blue>', style);

            expect(measured.runsByLine).toBeDefined();
            expect(measured.lines[0]).toBe('HelloWorld');
        });
    });

    describe('edge cases with tags', () =>
    {
        it('should handle empty tag content', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red></red>', style);

            expect(measured).toBeDefined();
        });

        it('should handle tag with only whitespace', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red>   </red>', style);

            expect(measured).toBeDefined();
        });

        it('should handle multiple tags on same line', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    a: { fill: 'red' },
                    b: { fill: 'blue' },
                    c: { fill: 'green' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<a>One</a> <b>Two</b> <c>Three</c>', style);

            expect(measured.runsByLine[0].length).toBeGreaterThanOrEqual(5);
        });

        it('should handle newlines inside tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red>Line 1\nLine 2</red>', style);

            expect(measured.lines.length).toBe(2);
            expect(measured.runsByLine.length).toBe(2);
        });

        it('should handle tags across multiple lines', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    big: { fontSize: 48 }
                }
            });

            const measured = CanvasTextMetrics.measureText('<big>Line 1</big>\n<big>Line 2</big>', style);

            expect(measured.lines.length).toBe(2);
            // Both lines should have the big font metrics
            expect(measured.lineAscents[0]).toBeGreaterThan(0);
            expect(measured.lineAscents[1]).toBeGreaterThan(0);
        });

        it('should treat text as plain when no tagStyles defined', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial'
                // No tagStyles
            });

            const measured = CanvasTextMetrics.measureText('<red>Hello</red>', style);

            // Should treat as plain text, not tagged
            expect(measured.runsByLine).toBeUndefined();
            expect(measured.lines[0]).toBe('<red>Hello</red>');
        });

        it('should treat undefined tags as plain text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            // 'unknown' tag is not defined
            const measured = CanvasTextMetrics.measureText('<unknown>Hello</unknown>', style);

            // Unknown tag should be treated as plain text or ignored
            expect(measured).toBeDefined();
        });
    });

    describe('tagStyles with alignment', () =>
    {
        it('should use wordWrapWidth for width with center alignment and tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'center',
                tagStyles: {
                    big: { fontSize: 48 }
                }
            });

            const measured = CanvasTextMetrics.measureText('<big>Hi</big>', style);

            expect(measured.width).toBeGreaterThanOrEqual(300);
        });

        it('should handle justify alignment with tagged text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 200,
                align: 'justify',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            const measured = CanvasTextMetrics.measureText('<red>This is a longer text</red>', style);

            expect(measured.runsByLine).toBeDefined();
        });
    });
});
