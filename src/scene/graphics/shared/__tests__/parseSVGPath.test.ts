import { GraphicsPath } from '../path/GraphicsPath';
import { parseSVGPath } from '../svg/parseSVGPath';

describe('parseSVGPath', () =>
{
    it('parses repeated coordinate pairs after moveto as implicit line commands', () =>
    {
        const path = parseSVGPath('M 0 0 10 10 20 0', new GraphicsPath());

        expect(path.instructions).toEqual([
            { action: 'moveTo', data: [0, 0] },
            { action: 'lineTo', data: [10, 10] },
            { action: 'lineTo', data: [20, 0] },
        ]);
    });

    it('parses repeated values for line and curve commands', () =>
    {
        const path = parseSVGPath('M0 0 L10 10 20 20 H30 40 V50 60 C1 2 3 4 5 6 7 8 9 10 11 12', new GraphicsPath());

        expect(path.instructions).toEqual([
            { action: 'moveTo', data: [0, 0] },
            { action: 'lineTo', data: [10, 10] },
            { action: 'lineTo', data: [20, 20] },
            { action: 'lineTo', data: [30, 20] },
            { action: 'lineTo', data: [40, 20] },
            { action: 'lineTo', data: [40, 50] },
            { action: 'lineTo', data: [40, 60] },
            { action: 'bezierCurveTo', data: [1, 2, 3, 4, 5, 6, undefined] },
            { action: 'bezierCurveTo', data: [7, 8, 9, 10, 11, 12, undefined] },
        ]);
    });

    it('parses relative commands and closepath', () =>
    {
        const path = parseSVGPath('M 10 10 l 5 0 h 5 v 5 z', new GraphicsPath());

        expect(path.instructions).toEqual([
            { action: 'moveTo', data: [10, 10] },
            { action: 'lineTo', data: [15, 10] },
            { action: 'lineTo', data: [20, 10] },
            { action: 'lineTo', data: [20, 15] },
            { action: 'closePath', data: [] },
        ]);
    });

    it('parses arc commands', () =>
    {
        const path = parseSVGPath('M 0 0 A 30 50 0 0 1 162.55 162.45 a 5 6 0 1 0 10 20', new GraphicsPath());

        expect(path.instructions).toEqual([
            { action: 'moveTo', data: [0, 0] },
            { action: 'arcToSvg', data: [30, 50, 0, 0, 1, 162.55, 162.45] },
            { action: 'arcToSvg', data: [5, 6, 0, 1, 0, 172.55, 182.45] },
        ]);
    });

    it('parses signed, decimal, and exponent values', () =>
    {
        const path = parseSVGPath('M +.5 -1e2 L 10. 2.5e1 L10-20L.5.6', new GraphicsPath());

        expect(path.instructions).toEqual([
            { action: 'moveTo', data: [0.5, -100] },
            { action: 'lineTo', data: [10, 25] },
            { action: 'lineTo', data: [10, -20] },
            { action: 'lineTo', data: [0.5, 0.6] },
        ]);
    });

    it('throws when a command has too few values', () =>
    {
        expect(() => parseSVGPath('M 0', new GraphicsPath())).toThrow('malformed path data');
    });
});
