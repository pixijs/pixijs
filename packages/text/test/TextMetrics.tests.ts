import type { ITextStyle } from '@pixi/text';
import { TextMetrics, TextStyle } from '@pixi/text';

/**
 * Fonts render slightly differently between platforms so tests that depend on a specific
 * widths or breaking of words may not be cross-platform
 */

/* eslint-disable no-multi-str */
const longText = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem \
accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo \
inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo \
enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia \
consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro \
quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, \
sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam \
quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam \
corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis \
autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil \
molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla \
pariatur?';

/* eslint-disable max-len */
const spaceNewLineText = ' Should have\u0009space\u2003at the\u2000beginning of the line.\n   And 3 more here. But after that there should be no\u3000more ridiculous spaces at the beginning of lines. And none at the end. And all this text is just to check the wrapping abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz. I \u2665 text. 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2     ';
const breakingWordText = 'Pixi.js - The HTML5 Creation Engine. Create beautiful digital content with the supercalifragilisticexpialidociously fastest, most flexible 2D WebGL renderer.';
const fillText = '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ';
const intergityText = '012345678901234567890123456789';
const nonBreakingSpaces = ['\u00A0', '\u2007', '\u202F'];

const breakingSpaces = [
    '\u0009',
    '\u0020',
    '\u2000',
    '\u2001',
    '\u2002',
    '\u2003',
    '\u2004',
    '\u2005',
    '\u2006',
    '\u2008',
    '\u2009',
    '\u200A',
    '\u205F',
    '\u3000',
];

describe('TextMetrics', () =>
{
    const defaultStyle = {
        breakWords: true,
        fontFamily: 'Arial',
        fontSize: 20,
        fontStyle: 'italic',
        fontVariant: 'normal',
        fontWeight: '900',
        wordWrap: true,
        wordWrapWidth: 200,
        letterSpacing: 4,
    } as Partial<ITextStyle>;

    describe('wordWrap without breakWords', () =>
    {
        it('width should not be greater than wordWrapWidth with longText', () =>
        {
            // On Windows 'exercitationem' renders to about 217px, bigger wrap width required for this test to be valid on every platform
            const style = Object.assign({}, defaultStyle, { wordWrapWidth: 220, breakWords: false }) as Partial<ITextStyle>;

            const metrics = TextMetrics.measureText(longText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line).toEqual(
                    expect.not.arrayContaining(['  ', 'should not have multiple spaces in a row'])
                );
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('width should be greater than wordWrapWidth with breakingWordText', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = TextMetrics.measureText(breakingWordText, new TextStyle(style));

            expect(metrics.width).toBeGreaterThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('width should be within a character width from wordWrapWidth with fillText', () =>
        {
            const charWidth = 4; // it should fill the line to at lease width -4

            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = TextMetrics.measureText(fillText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);
            expect(metrics.width + charWidth).toBeGreaterThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('width should be greater than wordWrapWidth and should format correct spaces', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).toBeGreaterThan(style.wordWrapWidth);

            expect(metrics.lines[0][0]).toEqual(' ');
            expect(metrics.lines[4][0]).toEqual(' ');
            expect(metrics.lines[4][1]).toEqual(' ');
            expect(metrics.lines[4][2]).toEqual(' ');
            expect(metrics.lines[4][3]).not.toEqual(' ');

            metrics.lines.forEach((line, i) =>
            {
                if (i !== 0 && i !== 4)
                {
                    expect(metrics.lines[1][0]).not.toEqual(' ');
                }
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('should be able to override wordWrap to false in measureText', () =>
        {
            const metrics = TextMetrics.measureText(longText, new TextStyle(defaultStyle), false);

            expect(metrics.lines.length).toEqual(1);
        });
    });

    describe('wordWrap with breakWords', () =>
    {
        it('width should not be greater than wordWrapWidth with longText', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(longText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('width should not be greater than wordWrapWidth with breakingWordAtStartText', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(breakingWordText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('width should be within a character width from wordWrapWidth with fillText', () =>
        {
            const charWidth = 4; // it should fill the line to at lease width -4

            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(fillText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);
            expect(metrics.width + charWidth).toBeGreaterThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        it('no words or characters should lost or changed', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(intergityText, new TextStyle(style));

            const lines = metrics.lines.reduce((accumulator, line) => accumulator + line);

            expect(lines).toEqual(intergityText);
        });

        it('width should not be greater than wordWrapWidth and should format correct spaces', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);

            expect(metrics.lines[0][0]).toEqual(' ');
            expect(metrics.lines[4][0]).toEqual(' ');
            expect(metrics.lines[4][1]).toEqual(' ');
            expect(metrics.lines[4][2]).toEqual(' ');
            expect(metrics.lines[4][3]).not.toEqual(' ');

            metrics.lines.forEach((line, i) =>
            {
                if (i !== 0 && i !== 4)
                {
                    expect(metrics.lines[1][0]).not.toEqual(' ');
                }
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });
    });

    describe('wordWrap misc', () =>
    {
        const originalSplit = TextMetrics.wordWrapSplit;

        afterEach(() =>
        {
            TextMetrics.wordWrapSplit = originalSplit;
        });

        it('should use configuration callback to split a token', () =>
        {
            let wasSplitCalled = false;

            TextMetrics.wordWrapSplit = (token) =>
            {
                wasSplitCalled = true;
                expect(token).toEqual('testword1234567890abcd!');

                return ['s', 'p', 'l', 'i', 't'];
            };

            const brokenText = TextMetrics['wordWrap']('testword1234567890abcd!', new TextStyle(defaultStyle));

            expect(wasSplitCalled).toEqual(true);
            expect(brokenText).toEqual('split');
        });
    });

    describe('whiteSpace `normal` without breakWords', () =>
    {
        it('multiple spaces should be collapsed to 1 and but not newlines', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).toBeGreaterThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line).toEqual(
                    expect.not.arrayContaining(['  ', 'should not have multiple spaces in a row'])
                );
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        // eslint-disable-next-line func-names
        it('text is wrapped in a platform-specific way', function ()
        {
            if (process.platform === 'win32')
            {
                return;

                return;
            }

            const style = Object.assign({}, defaultStyle, { breakWords: false, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.lines[0][0]).toEqual('S');
            expect(metrics.lines[4][0]).toEqual('m');
            expect(metrics.lines[4][1]).toEqual('o');
            expect(metrics.lines[4][2]).toEqual('r');
            expect(metrics.lines[17][0]).toEqual('a');
        });
    });

    describe('whiteSpace `pre-line` without breakWords', () =>
    {
        it('multiple spaces should be collapsed to 1 but not newlines', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false, whiteSpace: 'pre-line' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).toBeGreaterThan(style.wordWrapWidth);

            expect(metrics.lines[0][0]).toEqual('S');
            expect(metrics.lines[4][0]).toEqual('A');
            expect(metrics.lines[4][1]).toEqual('n');
            expect(metrics.lines[4][2]).toEqual('d');
            expect(metrics.lines[17][0]).toEqual('t');

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });
    });

    describe('whiteSpace `normal` with breakWords', () =>
    {
        it('multiple spaces should be collapsed to 1 and but not newlines', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line).toEqual(
                    expect.not.arrayContaining(['  ', 'should not have multiple spaces in a row'])
                );
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });

        // eslint-disable-next-line func-names
        it('text is wrapped in a platform-specific way', function ()
        {
            if (process.platform === 'win32')
            {
                return;

                return;
            }

            const style = Object.assign({}, defaultStyle, { breakWords: true, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.lines[0][0]).toEqual('S');
            expect(metrics.lines[4][0]).toEqual('m');
            expect(metrics.lines[4][1]).toEqual('o');
            expect(metrics.lines[4][2]).toEqual('r');
            expect(metrics.lines[17][0]).toEqual('a');
        });
    });

    describe('whiteSpace `pre-line` with breakWords', () =>
    {
        it('multiple spaces should be collapsed to 1 but not newlines', () =>
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true, whiteSpace: 'pre-line' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).toBeLessThan(style.wordWrapWidth);

            expect(metrics.lines[0][0]).toEqual('S');
            expect(metrics.lines[4][0]).toEqual('A');
            expect(metrics.lines[4][1]).toEqual('n');
            expect(metrics.lines[4][2]).toEqual('d');
            expect(metrics.lines[17][0]).toEqual('t');

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).not.toEqual(' ');
                expect(line[line.length - 1]).not.toEqual(' ');
            });
        });
    });

    describe('trimRight', () =>
    {
        it('string with no whitespaces to trim', () =>
        {
            const text = TextMetrics['trimRight']('remove white spaces to the right');

            expect(text).toEqual('remove white spaces to the right');
        });

        it('string with whitespaces to trim', () =>
        {
            const text = TextMetrics['trimRight']('remove white spaces to the right   ');

            expect(text).toEqual('remove white spaces to the right');
        });

        it('string with strange unicode whitespaces to trim', () =>
        {
            const text = TextMetrics['trimRight']('remove white spaces to the right\u0009\u0020\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\u3000');

            expect(text).toEqual('remove white spaces to the right');
        });

        it('empty string', () =>
        {
            const text = TextMetrics['trimRight']('');

            expect(text).toEqual('');
        });

        it('non-string input', () =>
        {
            // @ts-expect-error - should return false on non-string input
            const text = TextMetrics['trimRight']({});

            expect(text).toEqual('');
        });
    });

    describe('isNewline', () =>
    {
        it('line feed', () =>
        {
            const bool = TextMetrics['isNewline']('\n');

            expect(bool).toEqual(true);
        });

        it('carriage return', () =>
        {
            const bool = TextMetrics['isNewline']('\r');

            expect(bool).toEqual(true);
        });

        it('newline char', () =>
        {
            const bool = TextMetrics['isNewline']('A');

            expect(bool).toEqual(false);
        });

        it('non string', () =>
        {
            // @ts-expect-error - should return false on non-string input
            const bool = TextMetrics['isNewline']({});

            expect(bool).toEqual(false);
        });
    });

    describe('isBreakingSpace', () =>
    {
        it('legit breaking spaces', () =>
        {
            breakingSpaces.forEach((char) =>
            {
                const bool = TextMetrics.isBreakingSpace(char);

                expect(bool).toEqual(true);
            });
        });

        it('non breaking spaces', () =>
        {
            nonBreakingSpaces.forEach((char) =>
            {
                const bool = TextMetrics.isBreakingSpace(char);

                expect(bool).not.toEqual(true);
            });
        });

        it('newline char', () =>
        {
            const bool = TextMetrics.isBreakingSpace('A');

            expect(bool).toEqual(false);
        });

        it('non string', () =>
        {
            // @ts-expect-error - should return false on non-string input
            const bool = TextMetrics.isBreakingSpace({});

            expect(bool).toEqual(false);
        });

        it('overridable breaking spaces', () =>
        {
            const reg = /[あいうえお]/;

            const original = TextMetrics.isBreakingSpace;

            // override breakingSpace
            TextMetrics.isBreakingSpace = (char, nextChar) =>
            {
                const isBreakingSpace = breakingSpaces.includes(char);

                if (isBreakingSpace && nextChar)
                {
                    return !nextChar.match(reg);
                }

                return isBreakingSpace;
            };

            breakingSpaces.forEach((char) =>
            {
                const bool = TextMetrics.isBreakingSpace(char, 'あ');

                expect(bool).toEqual(false);
            });

            // reset the override breakingSpace
            TextMetrics.isBreakingSpace = original;
        });
    });

    describe('tokenize', () =>
    {
        it('full example', () =>
        {
            const arr = TextMetrics['tokenize'](spaceNewLineText);

            expect(arr).toBeArray();
            expect(arr.length).toEqual(146);
            expect(arr).toEqual(expect.not.arrayContaining(['']));
            expect(arr).toEqual(expect.not.arrayContaining([null]));
        });

        it('empty string', () =>
        {
            const arr = TextMetrics['tokenize']('');

            expect(arr).toBeArray();
            expect(arr.length).toEqual(0);
        });

        it('single char', () =>
        {
            const arr = TextMetrics['tokenize']('A');

            expect(arr).toBeArray();
            expect(arr.length).toEqual(1);
        });

        it('newline char', () =>
        {
            const arr = TextMetrics['tokenize']('\n');

            expect(arr).toBeArray();
            expect(arr.length).toEqual(1);
        });

        it('breakingSpaces', () =>
        {
            const arr = TextMetrics['tokenize'](breakingSpaces.join(''));

            expect(arr).toBeArray();
            expect(arr.length).toEqual(breakingSpaces.length);
        });

        it('non string', () =>
        {
            // @ts-expect-error - should return false on non-string input
            const arr = TextMetrics['tokenize']({});

            expect(arr).toBeArray();
            expect(arr.length).toEqual(0);
        });
    });

    describe('collapseSpaces', () =>
    {
        it('pre', () =>
        {
            const bool = TextMetrics['collapseSpaces']('pre');

            expect(bool).toEqual(false);
        });

        it('normal', () =>
        {
            const bool = TextMetrics['collapseSpaces']('normal');

            expect(bool).toEqual(true);
        });

        it('pre-line', () =>
        {
            const bool = TextMetrics['collapseSpaces']('pre-line');

            expect(bool).toEqual(true);
        });

        it('non matching string', () =>
        {
            // @ts-expect-error - should return false on non matching string
            const bool = TextMetrics['collapseSpaces']('bull');

            expect(bool).toEqual(false);
        });

        it('non string', () =>
        {
            // @ts-expect-error - should return false on non-string input
            const bool = TextMetrics['collapseSpaces']({});

            expect(bool).toEqual(false);
        });
    });

    describe('collapseNewlines', () =>
    {
        it('pre', () =>
        {
            const bool = TextMetrics['collapseNewlines']('pre');

            expect(bool).toEqual(false);
        });

        it('normal', () =>
        {
            const bool = TextMetrics['collapseNewlines']('normal');

            expect(bool).toEqual(true);
        });

        it('pre-line', () =>
        {
            const bool = TextMetrics['collapseNewlines']('pre-line');

            expect(bool).toEqual(false);
        });

        it('non matching string', () =>
        {
            // @ts-expect-error - should return false on non matching string
            const bool = TextMetrics['collapseNewlines']('bull');

            expect(bool).toEqual(false);
        });

        it('non string', () =>
        {
            // @ts-expect-error - should return false on non-string input
            const bool = TextMetrics['collapseNewlines']({});

            expect(bool).toEqual(false);
        });
    });

    describe('canBreakWords', () =>
    {
        it('breakWords: true', () =>
        {
            const bool = TextMetrics.canBreakWords('text', true);

            expect(bool).toEqual(true);
        });

        it('breakWords: false', () =>
        {
            const bool = TextMetrics.canBreakWords('text', false);

            expect(bool).toEqual(false);
        });
    });

    describe('canBreakChars', () =>
    {
        it('should always return true', () =>
        {
            // @ts-expect-error - function is meant to be overridden
            const bool = TextMetrics['canBreakChars']();

            expect(bool).toEqual(true);
        });

        it('should prevent breaking for all numbers', () =>
        {
            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 26,
                fontStyle: 'italic',
                fontVariant: 'normal',
                fontWeight: '900',
                wordWrap: true,
                wordWrapWidth: 300,
                letterSpacing: 4,
                padding: 10,
                fill: 0xffffff,
                breakWords: false,
                whiteSpace: 'pre-line',
            });

            const str = '-------0000,1111,9999------';
            const reg = /^\d+$/;

            TextMetrics.canBreakWords = () =>
                true;

            // override breakChars
            TextMetrics.canBreakChars = (char, nextChar) =>
                !(char.match(reg) && nextChar.match(reg));

            const metrics = TextMetrics.measureText(str, style);

            expect(metrics.lines[0]).toEqual('-------0000,1111,');
            expect(metrics.lines[1]).toEqual('9999------');
        });
    });
});
