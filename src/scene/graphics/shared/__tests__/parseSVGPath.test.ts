import { GraphicsPath } from '../path/GraphicsPath';

function instructions(svg: string)
{
    return new GraphicsPath(svg).instructions.map((instruction) => [instruction.action, instruction.data]);
}

describe('parseSVGPath', () =>
{
    it('should return to the start of the current subpath on Z after a subpath left open', () =>
    {
        // Z closes the subpath started by M20 20, so the relative l5 0 starts from (20, 20)
        expect(instructions('M0 0 L10 0 M20 20 L30 20 L30 30 Z l5 0')).toEqual([
            ['moveTo', [0, 0]],
            ['lineTo', [10, 0]],
            ['moveTo', [20, 20]],
            ['lineTo', [30, 20]],
            ['lineTo', [30, 30]],
            ['closePath', []],
            ['lineTo', [25, 20]],
        ]);
    });

    it('should start a relative move after Z from the start of the closed subpath', () =>
    {
        expect(instructions('M0 0 h10 m10 10 h10 v10 z m5 5 h1')).toEqual([
            ['moveTo', [0, 0]],
            ['lineTo', [10, 0]],
            ['moveTo', [20, 10]],
            ['lineTo', [30, 10]],
            ['lineTo', [30, 20]],
            ['closePath', []],
            ['moveTo', [25, 15]],
            ['lineTo', [26, 15]],
        ]);
    });

    it('should keep the subpath start when drawing on after Z without a move', () =>
    {
        expect(instructions('M10 10 h5 v5 z h10 v10 z l1 1')).toEqual([
            ['moveTo', [10, 10]],
            ['lineTo', [15, 10]],
            ['lineTo', [15, 15]],
            ['closePath', []],
            ['lineTo', [20, 10]],
            ['lineTo', [20, 20]],
            ['closePath', []],
            ['lineTo', [11, 11]],
        ]);
    });
});
