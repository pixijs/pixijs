/* eslint-disable jest/expect-expect -- assertions are in every test via expect().toBe() */
import { FillGradient } from '../fill/FillGradient';
import { GraphicsContext } from '../GraphicsContext';
import { graphicsContextToSvg } from '../svg/SVGExporter';
import { Matrix } from '~/maths';

/**
 * Normalises an SVG string for reliable comparison:
 * - trims whitespace
 * - collapses internal whitespace runs to single spaces
 * - sorts attributes on each element alphabetically so order doesn't matter
 *
 * The gradient `id` is auto-generated, so we replace `pixi-grad-N` with a
 * stable placeholder `pixi-grad-*` (and the matching `url(#...)` references).
 * @param svg
 */
function normaliseSvg(svg: string): string
{
    let s = svg.trim().replace(/\s+/g, ' ');

    // Stabilise gradient ids: pixi-grad-0, pixi-grad-1 → pixi-grad-*
    s = s.replace(/pixi-grad-\d+/g, 'pixi-grad-*');

    // Sort attributes within each opening/self-closing tag
    s = s.replace(/<(\w+)((?:\s+[a-zA-Z\-:]+="[^"]*")+)\s*(\/?)>/g, (_match, tag, attrs, selfClose) =>
    {
        const sorted = attrs
            .trim()
            .match(/[a-zA-Z\-:]+=(?:"[^"]*")/g)!
            .sort()
            .join(' ');

        return `<${tag} ${sorted}${selfClose ? '/>' : '>'}`;
    });

    return s;
}

/**
 * Helper: build a GraphicsContext, export to SVG, and normalise.
 * @param build
 */
function buildAndExport(build: (ctx: GraphicsContext) => void): string
{
    const ctx = new GraphicsContext();

    build(ctx);

    return normaliseSvg(graphicsContextToSvg(ctx));
}

describe('SVGExporter', () =>
{
    it('should export a rectangle with fill', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.rect(10, 20, 100, 50);
            ctx.fill({ color: 0xff0000 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="10 20 100 50">'
            + '<path d="M10 20L110 20L110 70L10 70Z" fill="#ff0000"/>'
            + '</svg>'
        ));
    });

    it('should export a circle with fill', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.circle(50, 50, 30);
            ctx.fill({ color: 0x00ff00 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="20 20 60 60">'
            + '<path d="M20 50A30 30 0 1 1 80 50A30 30 0 1 1 20 50Z" fill="#00ff00"/>'
            + '</svg>'
        ));
    });

    it('should export a stroked line', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.moveTo(0, 0);
            ctx.lineTo(100, 100);
            ctx.stroke({ color: 0x0000ff, width: 3 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="103" height="103" viewBox="-1.5 -1.5 103 103">'
            + '<path d="M0 0L100 100" fill="none" stroke="#0000ff" stroke-width="3"/>'
            + '</svg>'
        ));
    });

    it('should export fill with alpha', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.rect(0, 0, 50, 50);
            ctx.fill({ color: 0xffffff, alpha: 0.5 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">'
            + '<path d="M0 0L50 0L50 50L0 50Z" fill="#ffffff" fill-opacity="0.5"/>'
            + '</svg>'
        ));
    });

    it('should handle fill + cut as evenodd', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.rect(0, 0, 100, 100);
            ctx.fill({ color: 0x000000 });
            ctx.rect(25, 25, 50, 50);
            ctx.cut();
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">'
            + '<path d="M0 0L100 0L100 100L0 100ZM0 0M25 25L75 25L75 75L25 75Z"'
            + ' fill="#000000" fill-rule="evenodd"/>'
            + '</svg>'
        ));
    });

    it('should export bezier curves', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(10, 20, 30, 40, 50, 60);
            ctx.fill({ color: 0x000000 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="60" viewBox="0 0 50 60">'
            + '<path d="M0 0C10 20 30 40 50 60" fill="#000000"/>'
            + '</svg>'
        ));
    });

    it('should export quadratic curves', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(25, 50, 50, 0);
            ctx.fill({ color: 0x000000 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="24.9" viewBox="0 0 50 24.9">'
            + '<path d="M0 0Q25 50 50 0" fill="#000000"/>'
            + '</svg>'
        ));
    });

    it('should export ellipse', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.ellipse(50, 50, 40, 20);
            ctx.fill({ color: 0x000000 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="10 30 80 40">'
            + '<path d="M10 50A40 20 0 1 1 90 50A40 20 0 1 1 10 50Z" fill="#000000"/>'
            + '</svg>'
        ));
    });

    it('should export rounded rectangle', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.roundRect(0, 0, 100, 50, 10);
            ctx.fill({ color: 0x000000 });
        });

        const expectedPath = 'M10 0L90 0A10 10 0 0 1 100 10L100 40'
            + 'A10 10 0 0 1 90 50L10 50A10 10 0 0 1 0 40L0 10A10 10 0 0 1 10 0Z';

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">'
            + `<path d="${expectedPath}" fill="#000000"/>`
            + '</svg>'
        ));
    });

    it('should export stroke attributes', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.moveTo(0, 0);
            ctx.lineTo(100, 0);
            ctx.stroke({ color: 0x000000, width: 2, cap: 'round', join: 'bevel' });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="102" height="2" viewBox="-1 -1 102 2">'
            + '<path d="M0 0L100 0" fill="none" stroke="#000000"'
            + ' stroke-width="2" stroke-linecap="round" stroke-linejoin="bevel"/>'
            + '</svg>'
        ));
    });

    it('should export polygon', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.poly([0, 0, 50, 100, 100, 0], true);
            ctx.fill({ color: 0x000000 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">'
            + '<path d="M0 0L50 100L100 0Z" fill="#000000"/>'
            + '</svg>'
        ));
    });

    it('should export stroke with viewBox padding', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            ctx.rect(10, 10, 80, 80);
            ctx.stroke({ color: 0x000000, width: 4 });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="8 8 84 84">'
            + '<path d="M10 10L90 10L90 90L10 90Z" fill="none" stroke="#000000" stroke-width="4"/>'
            + '</svg>'
        ));
    });

    it('should export linear gradient', () =>
    {
        const actual = buildAndExport((ctx) =>
        {
            const gradient = new FillGradient({
                type: 'linear',
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
                colorStops: [
                    { offset: 0, color: 0xff0000 },
                    { offset: 1, color: 0x0000ff },
                ],
            });

            ctx.rect(0, 0, 100, 100);
            ctx.fill({ fill: gradient });
        });

        expect(actual).toBe(normaliseSvg(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">'
            + '<defs>'
            + '<linearGradient id="pixi-grad-0" gradientUnits="objectBoundingBox"'
            + ' x1="0" y1="0" x2="1" y2="0">'
            + '<stop offset="0" stop-color="#ff0000"/>'
            + '<stop offset="1" stop-color="#0000ff"/>'
            + '</linearGradient>'
            + '</defs>'
            + '<path d="M0 0L100 0L100 100L0 100Z" fill="url(#pixi-grad-0)"/>'
            + '</svg>'
        ));
    });

    describe('regressions', () =>
    {
        it('should emit a rect exactly once when combined with a regularPoly in the same fill', () =>
        {
            const ctx = new GraphicsContext();

            ctx.rect(0, 0, 10, 10);
            ctx.regularPoly(50, 50, 20, 6);
            ctx.fill({ color: 0x000000 });

            const svg = graphicsContextToSvg(ctx);
            const rectStarts = (svg.match(/M0 0L10 0/g) || []).length;

            expect(rectStarts).toBe(1);
        });

        it('should emit exactly one moveTo per polygon when multiple complex shapes share a fill', () =>
        {
            const ctx = new GraphicsContext();

            ctx.regularPoly(20, 20, 10, 5);
            ctx.regularPoly(80, 80, 10, 5);
            ctx.fill({ color: 0x000000 });

            const svg = graphicsContextToSvg(ctx);
            const d = svg.match(/d="([^"]+)"/)![1];
            const moveCount = (d.match(/M/g) || []).length;

            expect(moveCount).toBe(2);
        });

        it('should emit a valid SVG path when arc is the only instruction', () =>
        {
            const ctx = new GraphicsContext();

            ctx.arc(50, 50, 25, 0, Math.PI);
            ctx.fill({ color: 0x000000 });

            const svg = graphicsContextToSvg(ctx);
            const d = svg.match(/d="([^"]+)"/)![1];

            expect(d.startsWith('M')).toBe(true);
        });

        it('should honour the active context transform on rect', () =>
        {
            const ctx = new GraphicsContext();

            ctx.setTransform(new Matrix().translate(100, 200));
            ctx.rect(0, 0, 10, 10);
            ctx.fill({ color: 0x000000 });

            const svg = graphicsContextToSvg(ctx);

            expect(svg).toContain('M100 200');
            expect(svg).not.toMatch(/d="M0 0L10 0L10 10L0 10Z"/);
        });

        it('should start a new subpath when arc follows a closed shape', () =>
        {
            const ctx = new GraphicsContext();

            ctx.rect(0, 0, 10, 10);
            ctx.arc(50, 50, 10, 0, Math.PI);
            ctx.fill({ color: 0x000000 });

            const svg = graphicsContextToSvg(ctx);
            const d = svg.match(/d="([^"]+)"/)![1];

            expect(d).not.toContain('ZL');
        });

        it('should derive the viewBox from context bounds without extra stroke padding', () =>
        {
            const ctx = new GraphicsContext();

            ctx.rect(10, 10, 80, 80);
            ctx.stroke({ color: 0x000000, width: 4 });

            const bounds = ctx.bounds;
            const svg = graphicsContextToSvg(ctx);
            const viewBox = svg.match(/viewBox="([^"]+)"/)![1];
            const [x, y, w, h] = viewBox.split(' ').map(parseFloat);

            expect(x).toBeCloseTo(bounds.minX, 5);
            expect(y).toBeCloseTo(bounds.minY, 5);
            expect(w).toBeCloseTo(bounds.maxX - bounds.minX, 5);
            expect(h).toBeCloseTo(bounds.maxY - bounds.minY, 5);
        });
    });
});
