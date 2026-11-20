import { FillGradient } from '../../graphics/shared/fill/FillGradient';
import { getCanvasFillStyle } from '../canvas/utils/getCanvasFillStyle';

import type { ConvertedFillStyle } from '../../graphics/shared/FillTypes';
import type { CanvasTextMetrics } from '../canvas/CanvasTextMetrics';

const FONT_SIZE = 24;
const ASCENT = 17.5;

interface GradientStop { offset: number, color: string }

function createVerticalGradient(): FillGradient
{
    return new FillGradient({
        type: 'linear',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        colorStops: [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#0000ff' },
        ],
    });
}

// The lineHeight field on CanvasTextMetrics is style.lineHeight + leading (see measureText).
function fieldLineHeight(styleLineHeight: number, leading: number): number
{
    return styleLineHeight + leading;
}

// Mirrors the height CanvasTextMetrics.measureText computes (no stroke / padding adjustments).
function textHeight(styleLineHeight: number, leading: number, lineCount: number): number
{
    return Math.max(styleLineHeight, FONT_SIZE) + ((lineCount - 1) * fieldLineHeight(styleLineHeight, leading));
}

// Mirrors the baseline position CanvasTextGenerator uses for line i (no stroke).
function baselineY(line: number, lineHeightField: number): number
{
    const shift = Math.max(0, (lineHeightField - FONT_SIZE) / 2);

    return (line * lineHeightField) + ASCENT + shift;
}

function getStops(styleLineHeight: number, leading: number, lines: string[], withFontProperties = true): GradientStop[]
{
    const lineHeight = fieldLineHeight(styleLineHeight, leading);

    const textMetrics = {
        width: 100,
        height: textHeight(styleLineHeight, leading, lines.length),
        lineHeight,
        lines,
        ...(withFontProperties ? { fontProperties: { fontSize: FONT_SIZE, ascent: ASCENT } } : {}),
    } as unknown as CanvasTextMetrics;

    const stops: GradientStop[] = [];

    const context = {
        createLinearGradient: () => ({
            addColorStop: (offset: number, color: string) => { stops.push({ offset, color }); },
        }),
    };

    getCanvasFillStyle(
        { fill: createVerticalGradient(), texture: null } as unknown as ConvertedFillStyle,
        context as never,
        textMetrics
    );

    return stops;
}

// Samples the red channel (0..1) of the red->blue gradient at fraction f of the canvas height.
function sampleRed(stops: GradientStop[], f: number): number
{
    const sorted = stops.slice().sort((a, b) => a.offset - b.offset);
    const redOf = (color: string) => parseInt(color.slice(1, 3), 16) / 255;

    if (f <= sorted[0].offset) return redOf(sorted[0].color);
    if (f >= sorted[sorted.length - 1].offset) return redOf(sorted[sorted.length - 1].color);

    for (let i = 0; i < sorted.length - 1; i++)
    {
        const lo = sorted[i];
        const hi = sorted[i + 1];

        if (f >= lo.offset && f <= hi.offset)
        {
            const t = hi.offset === lo.offset ? 0 : (f - lo.offset) / (hi.offset - lo.offset);

            return redOf(lo.color) + ((redOf(hi.color) - redOf(lo.color)) * t);
        }
    }

    return redOf(sorted[sorted.length - 1].color);
}

// Samples the gradient's red channel (0..1) at line `line`'s baseline.
function sampleAt(styleLineHeight: number, leading: number, line: number): number
{
    return sampleRed(
        getStops(styleLineHeight, leading, ['line0', 'line1']),
        baselineY(line, fieldLineHeight(styleLineHeight, leading)) / textHeight(styleLineHeight, leading, 2)
    );
}

describe('getCanvasFillStyle vertical-gradient per-line repeat', () =>
{
    it('every line shows the same gradient, invariant to lineHeight (#12167)', () =>
    {
        // lineHeight >= fontSize keeps each line's glyph box (and thus its gradient cycle) from
        // overlapping the next line's, so the per-line repeat is well defined. lineHeight < fontSize
        // is degenerate: glyph boxes overlap and so do the cycles, which a 1D canvas gradient cannot
        // express unambiguously (pre-existing, also true before the #12167 fix).
        const cases = [
            { lineHeight: 24, leading: 0 },
            { lineHeight: 48, leading: 0 },
            { lineHeight: 96, leading: 0 },
        ];
        const base = sampleAt(24, 0, 0);

        for (const { lineHeight, leading } of cases)
        {
            // both lines sample the same part of the gradient
            expect(sampleAt(lineHeight, leading, 0)).toBeCloseTo(sampleAt(lineHeight, leading, 1), 4);
            // and the sample does not shift when lineHeight changes
            expect(sampleAt(lineHeight, leading, 0)).toBeCloseTo(base, 4);
        }
    });

    it('leading does not shift the gradient on non-clipped lines', () =>
    {
        // NOTE: leading>0 makes CanvasTextMetrics.height short by `leading` px for the last line
        // (baseHeight = max(lineHeight, fontSize) + (n-1)*(lineHeight + leading), but line boxes are
        // lineHeight + leading tall). The last line's glyphs and gradient cycle are clipped at the
        // canvas bottom - a pre-existing bug unrelated to #12167 (the old code clamped the same way).
        // Non-clipped lines must still anchor their cycle to the glyph box, so the baseline lands at
        // ascent/fontSize regardless of leading.
        for (const leading of [0, 5, 10])
        {
            expect(sampleAt(24, leading, 0)).toBeCloseTo(1 - (ASCENT / FONT_SIZE), 4);
        }
    });

    it('anchors the gradient to the glyph box: baseline sits at ascent/fontSize into the cycle', () =>
    {
        // red channel of red->blue at t = ASCENT / FONT_SIZE is 1 - (ASCENT / FONT_SIZE)
        expect(sampleAt(48, 0, 0)).toBeCloseTo(1 - (ASCENT / FONT_SIZE), 4);
    });

    it('each line spans a full gradient cycle anchored at its glyph box', () =>
    {
        // fontSize=24, height=48 -> cycle length 0.5, line1 starts at 24/48 = 0.5
        const stops = getStops(24, 0, ['line0', 'line1']);

        expect(stops.map((s) => s.offset)).toEqual([0, 0.5, 0.5, 1]);
    });

    it('falls back to old behaviour for tagged-text metrics (no fontProperties)', () =>
    {
        const stops = getStops(40, 0, ['single'], false);

        expect(stops).toHaveLength(2);
        expect(stops[0].offset).toBe(0);
        expect(stops[1].offset).toBe(1);
    });
});
