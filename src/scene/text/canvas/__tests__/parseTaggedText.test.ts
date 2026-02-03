import '~/environment-browser/browserAll';
import { TextStyle } from '../../TextStyle';
import { getPlainText, hasTagMarkup, hasTagStyles, parseTaggedText } from '../utils/parseTaggedText';

describe('parseTaggedText', () =>
{
    describe('hasTagStyles', () =>
    {
        it('should return false for style without tagStyles', () =>
        {
            const style = new TextStyle({ fontSize: 24 });

            expect(hasTagStyles(style)).toBe(false);
        });

        it('should return false for style with empty tagStyles', () =>
        {
            const style = new TextStyle({ fontSize: 24, tagStyles: {} });

            expect(hasTagStyles(style)).toBe(false);
        });

        it('should return true for style with tagStyles', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });

            expect(hasTagStyles(style)).toBe(true);
        });
    });

    describe('hasTagMarkup', () =>
    {
        it('should return false for text without angle brackets', () =>
        {
            expect(hasTagMarkup('Hello World')).toBe(false);
        });

        it('should return true for text with angle brackets', () =>
        {
            expect(hasTagMarkup('<red>Hello</red>')).toBe(true);
        });
    });

    describe('parseTaggedText', () =>
    {
        it('should return single run for plain text', () =>
        {
            const style = new TextStyle({ fontSize: 24 });
            const runs = parseTaggedText('Hello World', style);

            expect(runs.length).toBe(1);
            expect(runs[0].text).toBe('Hello World');
            expect(runs[0].style).toBe(style);
        });

        it('should return single run when tagStyles is empty', () =>
        {
            const style = new TextStyle({ fontSize: 24, tagStyles: {} });
            const runs = parseTaggedText('<fake>Hello</fake>', style);

            expect(runs.length).toBe(1);
            expect(runs[0].text).toBe('<fake>Hello</fake>');
        });

        it('should parse simple tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: 'white',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const runs = parseTaggedText('<red>Hello</red>', style);

            expect(runs.length).toBe(1);
            expect(runs[0].text).toBe('Hello');
            expect(runs[0].style.fill).toBe('red');
        });

        it('should handle text before, inside, and after tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: 'white',
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const runs = parseTaggedText('Start <red>Middle</red> End', style);

            expect(runs.length).toBe(3);
            expect(runs[0].text).toBe('Start ');
            expect(runs[0].style.fill).toBe('white');
            expect(runs[1].text).toBe('Middle');
            expect(runs[1].style.fill).toBe('red');
            expect(runs[2].text).toBe(' End');
            expect(runs[2].style.fill).toBe('white');
        });

        it('should handle nested tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                fill: 'white',
                tagStyles: {
                    bold: { fontWeight: 'bold' },
                    red: { fill: 'red' }
                }
            });
            const runs = parseTaggedText('<bold><red>Bold Red</red></bold>', style);

            expect(runs.length).toBe(1);
            expect(runs[0].text).toBe('Bold Red');
            expect(runs[0].style.fontWeight).toBe('bold');
            expect(runs[0].style.fill).toBe('red');
        });

        it('should treat unknown tags as literal text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const runs = parseTaggedText('<unknown>Hello</unknown>', style);

            expect(runs.length).toBe(1);
            expect(runs[0].text).toBe('<unknown>Hello</unknown>');
        });

        it('should handle unclosed tags', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                tagStyles: {
                    red: { fill: 'red' }
                }
            });
            const runs = parseTaggedText('<red>Unclosed', style);

            expect(runs.length).toBe(1);
            expect(runs[0].text).toBe('Unclosed');
            expect(runs[0].style.fill).toBe('red');
        });

        it('should inherit font size in tagged style', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                tagStyles: {
                    big: { fontSize: 48 }
                }
            });
            const runs = parseTaggedText('Small <big>Big</big> Small', style);

            expect(runs.length).toBe(3);
            expect(runs[0].style.fontSize).toBe(24);
            expect(runs[1].style.fontSize).toBe(48);
            expect(runs[2].style.fontSize).toBe(24);
        });
    });

    describe('getPlainText', () =>
    {
        it('should return same text when no tagStyles', () =>
        {
            const style = new TextStyle({ fontSize: 24 });

            expect(getPlainText('<red>Hello</red>', style)).toBe('<red>Hello</red>');
        });

        it('should strip tags and return plain text', () =>
        {
            const style = new TextStyle({
                fontSize: 24,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' }
                }
            });

            expect(getPlainText('<red>Hello</red> <blue>World</blue>', style)).toBe('Hello World');
        });
    });
});
