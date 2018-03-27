'use strict';

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
const spaceNewLineText = ' Should have\u0009space\u2003at the\u2000beginning of the line.\n   And 3 more here. But after that there should be no\u3000more spaces at the beginning of lines. And none at the end. And all this text is just to check the wrapping abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz. I \u2665 text. 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2     ';

const breakingWordText = 'Pixi.js - The HTML5 Creation Engine. Create beautiful \
digital content with the supercalifragilisticexpialidociously fastest, most \
flexible 2D WebGL renderer.';

const fillText = '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .\
. . . . . . . . . . . . . . . . . . . . . . . . ';

const intergityText = '012345678901234567890123456789';

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
            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = PIXI.TextMetrics.measureText(longText, new PIXI.TextStyle(style));

            expect(metrics.width).to.be.below(style.wordWrapWidth);

            metrics.lines.forEach((line) =>
            {
                expect(line[0]).to.not.equal(' ', 'should not have space at the start');
                expect(line[line - 1]).to.not.equal(' ', 'should not have space at the end');
            });
        });

        it('width should be greater than wordWrapWidth with breakingWordText', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: false });

            const metrics = PIXI.TextMetrics.measureText(breakingWordText, new PIXI.TextStyle(style));

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

            const metrics = PIXI.TextMetrics.measureText(fillText, new PIXI.TextStyle(style));

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

            const metrics = PIXI.TextMetrics.measureText(spaceNewLineText, new PIXI.TextStyle(style));

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
    });

    describe('wordWrap with breakWords', function ()
    {
        it('width should not be greater than wordWrapWidth with longText', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = PIXI.TextMetrics.measureText(longText, new PIXI.TextStyle(style));

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

            const metrics = PIXI.TextMetrics.measureText(breakingWordText, new PIXI.TextStyle(style));

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

            const metrics = PIXI.TextMetrics.measureText(fillText, new PIXI.TextStyle(style));

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

            const metrics = PIXI.TextMetrics.measureText(intergityText, new PIXI.TextStyle(style));

            const lines = metrics.lines.reduce((accumulator, line) => accumulator + line);

            expect(lines).to.equal(intergityText, 'should have the same chars as the original text');
        });

        it('width should not be greater than wordWrapWidth and should format correct spaces', function ()
        {
            const style = Object.assign({}, defaultStyle, { breakWords: true });

            const metrics = PIXI.TextMetrics.measureText(spaceNewLineText, new PIXI.TextStyle(style));

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
});
