const { TextMetrics, TextStyle } = require('../');

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

describe('PIXI.TextMetrics', function ()
{
    const defaultStyle = {
        breakWords: true,
        fontFamily: 'Arial',
        fontSize: 20,
        fontStyle: 'italic',
        fontVariant: 'normal',
        fontWeight: 900,
        wordWrap: true,
        wordWrapWidth: 200,
        letterSpacing: 4,
    };

    describe('wordWrap without breakWords', function ()
    {
        it('width should not be greater than wordWrapWidth with longText', function ()
        {
            // On Windows 'exercitationem' renders to about 217px, bigger wrap width required for this test to be valid on every platform
            const style = Object.assign({}, defaultStyle, { wordWrapWidth: 220, breakWords: false });

            const metrics = TextMetrics.measureText(longText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line).to.not.contain('  ', 'should not have multiple spaces in a row');
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('width should be greater than wordWrapWidth with breakingWordText', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = TextMetrics.measureText(breakingWordText, new TextStyle(style));

            expect(metrics.width).to.be.above(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('width should be within a character width from wordWrapWidth with fillText', function ()
        {
            const charWidth = 4; // it should fill the line to at lease width -4

            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = TextMetrics.measureText(fillText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);
            expect(metrics.width + charWidth).to.be.above(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('width should be greater than wordWrapWidth and should format correct spaces', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).to.be.above(style.wordWrapWidth);

            expect(metrics.lines[0][0]).to.equal(' ', '1st line should start with a space');
            expect(metrics.lines[4][0]).to.equal(' ', '5th line should start with 3 spaces (1)');
            expect(metrics.lines[4][1]).to.equal(' ', '5th line should start with 3 spaces (2)');
            expect(metrics.lines[4][2]).to.equal(' ', '5th line should start with 3 spaces (3)');
            expect(metrics.lines[4][3]).to.not.equal(' ', '5th line should not have a space as the 4th char');

            metrics.lines.forEach((line, i) =>
            {
                if (i !== 0 && i !== 4)
                {
                    expect(metrics.lines[1][0]).to.not.equal(' ', 'all lines except 1 & 5 should not have space at the start');
                }
                expect(line[line - 1]).to.not.equal(' ', 'no lines should have a space at the end');
            });
        });

        it('should be able to override wordWrap to false in measureText', function ()
        {
            const metrics = TextMetrics.measureText(longText, new TextStyle(defaultStyle), false);

            expect(metrics.lines.length).to.equal(1);
        });
    });

    describe('wordWrap with breakWords', function ()
    {
        it('width should not be greater than wordWrapWidth with longText', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(longText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('width should not be greater than wordWrapWidth with breakingWordAtStartText', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(breakingWordText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('width should be within a character width from wordWrapWidth with fillText', function ()
        {
            const charWidth = 4; // it should fill the line to at lease width -4

            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(fillText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);
            expect(metrics.width + charWidth).to.be.above(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('no words or characters should lost or changed', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(intergityText, new TextStyle(style));

            const lines = metrics.lines.reduce((accumulator, line) => accumulator + line);

            expect(lines).to.equal(intergityText, 'should have the same chars as the original text');
        });

        it('width should not be greater than wordWrapWidth and should format correct spaces', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            expect(metrics.lines[0][0]).to.equal(' ', '1st line should start with a space');
            expect(metrics.lines[4][0]).to.equal(' ', '5th line should start with 3 spaces (1)');
            expect(metrics.lines[4][1]).to.equal(' ', '5th line should start with 3 spaces (2)');
            expect(metrics.lines[4][2]).to.equal(' ', '5th line should start with 3 spaces (3)');
            expect(metrics.lines[4][3]).to.not.equal(' ', '5th line should not have a space as the 4th char');

            metrics.lines.forEach((line, i) =>
            {
                if (i !== 0 && i !== 4)
                {
                    expect(metrics.lines[1][0]).to.not.equal(' ', 'all lines except 1 & 5 should not have space at the start');
                }
                expect(line[line - 1]).to.not.equal(' ', 'no lines should have a space at the end');
            });
        });
    });

    describe('wordWrap misc', function ()
    {
        const originalSplit = TextMetrics.wordWrapSplit;

        afterEach(function ()
        {
            TextMetrics.wordWrapSplit = originalSplit;
        });

        it('should use configuration callback to split a token', () =>
        {
            let wasSplitCalled = false;

            TextMetrics.wordWrapSplit = (token) =>
            {
                wasSplitCalled = true;
                expect(token).to.equal('testword1234567890abcd!');

                return ['s', 'p', 'l', 'i', 't'];
            };

            const brokenText = TextMetrics.wordWrap('testword1234567890abcd!', new TextStyle(defaultStyle));

            expect(wasSplitCalled).to.equal(true);
            expect(brokenText).to.equal('split');
        });
    });

    describe('whiteSpace `normal` without breakWords', function ()
    {
        it('multiple spaces should be collapsed to 1 and but not newlines', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).to.be.above(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line).to.not.contain('  ', 'should not have multiple spaces in a row');
                expect(line[0]).to.not.equal(' ', 'all lines should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'no lines should have a space at the end');
            });
        });

        it('text is wrapped in a platform-specific way', function ()
        {
            if (process.platform === 'win32')
            {
                this.skip();

                return;
            }

            const style = Object.assign({}, defaultStyle, { breakWords: false, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.lines[0][0]).to.equal('S', '1st line should not start with a space');
            expect(metrics.lines[4][0]).to.equal('m', '5th line should not start with 3 spaces (1)');
            expect(metrics.lines[4][1]).to.equal('o', '5th line should not start with 3 spaces (2)');
            expect(metrics.lines[4][2]).to.equal('r', '5th line should not start with 3 spaces (3)');
            expect(metrics.lines[17][0]).to.equal('a', '17th line should not have wrapped');
        });
    });

    describe('whiteSpace `pre-line` without breakWords', function ()
    {
        it('multiple spaces should be collapsed to 1 but not newlines', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false, whiteSpace: 'pre-line' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).to.be.above(style.wordWrapWidth);

            expect(metrics.lines[0][0]).to.equal('S', '1st line should not start with a space');
            expect(metrics.lines[4][0]).to.equal('A', '5th line should not start with 3 spaces (1)');
            expect(metrics.lines[4][1]).to.equal('n', '5th line should not start with 3 spaces (2)');
            expect(metrics.lines[4][2]).to.equal('d', '5th line should not start with 3 spaces (3)');
            expect(metrics.lines[17][0]).to.equal('t', '17th line should have wrapped');

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'all lines should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'no lines should have a space at the end');
            });
        });
    });

    describe('whiteSpace `normal` with breakWords', function ()
    {
        it('multiple spaces should be collapsed to 1 and but not newlines', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line).to.not.contain('  ', 'should not have multiple spaces in a row');
                expect(line[0]).to.not.equal(' ', 'all lines should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'no lines should have a space at the end');
            });
        });

        it('text is wrapped in a platform-specific way', function ()
        {
            if (process.platform === 'win32')
            {
                this.skip();

                return;
            }

            const style = Object.assign({}, defaultStyle, { breakWords: true, whiteSpace: 'normal' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.lines[0][0]).to.equal('S', '1st line should not start with a space');
            expect(metrics.lines[4][0]).to.equal('m', '5th line should not start with 3 spaces (1)');
            expect(metrics.lines[4][1]).to.equal('o', '5th line should not start with 3 spaces (2)');
            expect(metrics.lines[4][2]).to.equal('r', '5th line should not start with 3 spaces (3)');
            expect(metrics.lines[17][0]).to.equal('a', '17th line should not have wrapped');
        });
    });

    describe('whiteSpace `pre-line` with breakWords', function ()
    {
        it('multiple spaces should be collapsed to 1 but not newlines', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true, whiteSpace: 'pre-line' });

            const metrics = TextMetrics.measureText(spaceNewLineText, new TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            expect(metrics.lines[0][0]).to.equal('S', '1st line should not start with a space');
            expect(metrics.lines[4][0]).to.equal('A', '5th line should not start with 3 spaces (1)');
            expect(metrics.lines[4][1]).to.equal('n', '5th line should not start with 3 spaces (2)');
            expect(metrics.lines[4][2]).to.equal('d', '5th line should not start with 3 spaces (3)');
            expect(metrics.lines[17][0]).to.equal('t', '17th line should have wrapped');

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'all lines should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'no lines should have a space at the end');
            });
        });
    });

    describe('trimRight', function ()
    {
        it('string with no whitespaces to trim', function ()
        {
            const text = TextMetrics.trimRight('remove white spaces to the right');

            expect(text).to.equal('remove white spaces to the right');
        });

        it('string with whitespaces to trim', function ()
        {
            const text = TextMetrics.trimRight('remove white spaces to the right   ');

            expect(text).to.equal('remove white spaces to the right');
        });

        it('string with strange unicode whitespaces to trim', function ()
        {
            const text = TextMetrics.trimRight('remove white spaces to the right\u0009\u0020\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\u3000');

            expect(text).to.equal('remove white spaces to the right');
        });

        it('empty string', function ()
        {
            const text = TextMetrics.trimRight('');

            expect(text).to.equal('');
        });

        it('non-string input', function ()
        {
            const text = TextMetrics.trimRight({});

            expect(text).to.equal('');
        });
    });

    describe('isNewline', function ()
    {
        it('line feed', function ()
        {
            const bool = TextMetrics.isNewline('\n');

            expect(bool).to.equal(true);
        });

        it('carriage return', function ()
        {
            const bool = TextMetrics.isNewline('\r');

            expect(bool).to.equal(true);
        });

        it('newline char', function ()
        {
            const bool = TextMetrics.isNewline('A');

            expect(bool).to.equal(false);
        });

        it('non string', function ()
        {
            const bool = TextMetrics.isNewline({});

            expect(bool).to.equal(false);
        });
    });

    describe('isBreakingSpace', function ()
    {
        it('legit breaking spaces', function ()
        {
            breakingSpaces.forEach((char) =>
            {
                const bool = TextMetrics.isBreakingSpace(char);

                expect(bool).to.equal(true);
            });
        });

        it('non breaking spaces', function ()
        {
            nonBreakingSpaces.forEach((char) =>
            {
                const bool = TextMetrics.isBreakingSpace(char);

                expect(bool).to.not.equal(true);
            });
        });

        it('newline char', function ()
        {
            const bool = TextMetrics.isBreakingSpace('A');

            expect(bool).to.equal(false);
        });

        it('non string', function ()
        {
            const bool = TextMetrics.isBreakingSpace({});

            expect(bool).to.equal(false);
        });
    });

    describe('tokenize', function ()
    {
        it('full example', function ()
        {
            const arr = TextMetrics.tokenize(spaceNewLineText);

            expect(arr).to.be.an('array');
            expect(arr.length).to.equal(146);
            expect(arr).to.not.contain('');
            expect(arr).to.not.contain(null);
        });

        it('empty string', function ()
        {
            const arr = TextMetrics.tokenize('');

            expect(arr).to.be.an('array');
            expect(arr.length).to.equal(0);
        });

        it('single char', function ()
        {
            const arr = TextMetrics.tokenize('A');

            expect(arr).to.be.an('array');
            expect(arr.length).to.equal(1);
        });

        it('newline char', function ()
        {
            const arr = TextMetrics.tokenize('\n');

            expect(arr).to.be.an('array');
            expect(arr.length).to.equal(1);
        });

        it('breakingSpaces', function ()
        {
            const arr = TextMetrics.tokenize(breakingSpaces.join(''));

            expect(arr).to.be.an('array');
            expect(arr.length).to.equal(breakingSpaces.length);
        });

        it('non string', function ()
        {
            const arr = TextMetrics.tokenize({});

            expect(arr).to.be.an('array');
            expect(arr.length).to.equal(0);
        });
    });

    describe('collapseSpaces', function ()
    {
        it('pre', function ()
        {
            const bool = TextMetrics.collapseSpaces('pre');

            expect(bool).to.equal(false);
        });

        it('normal', function ()
        {
            const bool = TextMetrics.collapseSpaces('normal');

            expect(bool).to.equal(true);
        });

        it('pre-line', function ()
        {
            const bool = TextMetrics.collapseSpaces('pre-line');

            expect(bool).to.equal(true);
        });

        it('non matching string', function ()
        {
            const bool = TextMetrics.collapseSpaces('bull');

            expect(bool).to.equal(false);
        });

        it('non string', function ()
        {
            const bool = TextMetrics.collapseSpaces({});

            expect(bool).to.equal(false);
        });
    });

    describe('collapseNewlines', function ()
    {
        it('pre', function ()
        {
            const bool = TextMetrics.collapseNewlines('pre');

            expect(bool).to.equal(false);
        });

        it('normal', function ()
        {
            const bool = TextMetrics.collapseNewlines('normal');

            expect(bool).to.equal(true);
        });

        it('pre-line', function ()
        {
            const bool = TextMetrics.collapseNewlines('pre-line');

            expect(bool).to.equal(false);
        });

        it('non matching string', function ()
        {
            const bool = TextMetrics.collapseNewlines('bull');

            expect(bool).to.equal(false);
        });

        it('non string', function ()
        {
            const bool = TextMetrics.collapseNewlines({});

            expect(bool).to.equal(false);
        });
    });

    describe('canBreakWords', function ()
    {
        it('breakWords: true', function ()
        {
            const bool = TextMetrics.canBreakWords('text', true);

            expect(bool).to.equal(true);
        });

        it('breakWords: false', function ()
        {
            const bool = TextMetrics.canBreakWords('text', false);

            expect(bool).to.equal(false);
        });
    });

    describe('canBreakChars', function ()
    {
        it('should always return true', function ()
        {
            const bool = TextMetrics.canBreakChars();

            expect(bool).to.equal(true);
        });

        it('should prevent breaking for all numbers', function ()
        {
            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 26,
                fontStyle: 'italic',
                fontVariant: 'normal',
                fontWeight: 900,
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

            TextMetrics.canBreakWords = function ()
            {
                return true;
            };

            // override breakChars
            TextMetrics.canBreakChars = function (char, nextChar)
            {
                return !(char.match(reg) && nextChar.match(reg));
            };

            const metrics = TextMetrics.measureText(str, style);

            expect(metrics.lines[0]).to.equal('-------0000,1111,');
            expect(metrics.lines[1]).to.equal('9999------');
        });
    });
});
