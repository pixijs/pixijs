import { FillGradient } from '../fill/FillGradient';
import { parseSVGDefinitions } from '../svg/parseSVGDefinitions';

import type { Session } from '../svg/SVGParser';

function parseDefs(defs: string): Session['defs']
{
    const svg = new DOMParser().parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${defs}</defs></svg>`,
        'image/svg+xml'
    ).documentElement as unknown as SVGElement;

    const session: Session = { context: null, path: null, defs: {} };

    parseSVGDefinitions(svg, session);

    return session.defs;
}

describe('parseSVGDefinitions', () =>
{
    it('should parse a radial gradient as a radial FillGradient', () =>
    {
        const { r } = parseDefs(`
            <radialGradient id="r" cx="0.25" cy="0.75" r="0.4">
                <stop offset="0" stop-color="#ffffff"/>
                <stop offset="1" stop-color="#000000"/>
            </radialGradient>
        `);

        expect(r).toBeInstanceOf(FillGradient);
        expect(r.type).toBe('radial');
        expect(r.outerCenter).toEqual({ x: 0.25, y: 0.75 });
        expect(r.outerRadius).toBe(0.4);
        expect(r.colorStops).toEqual([
            { offset: 0, color: '#ffffffff' },
            { offset: 1, color: '#000000ff' }
        ]);
    });

    it('should apply the SVG defaults when a radial gradient omits its geometry', () =>
    {
        const { r } = parseDefs(`
            <radialGradient id="r">
                <stop offset="0" stop-color="#ffffff"/>
                <stop offset="1" stop-color="#000000"/>
            </radialGradient>
        `);

        expect(r.center).toEqual({ x: 0.5, y: 0.5 });
        expect(r.outerCenter).toEqual({ x: 0.5, y: 0.5 });
        expect(r.innerRadius).toBe(0);
        expect(r.outerRadius).toBe(0.5);
    });

    it('should use the focal circle for the inner circle, defaulting to the outer center', () =>
    {
        const { focal, noFocal } = parseDefs(`
            <radialGradient id="focal" cx="0.5" cy="0.5" r="0.5" fx="0.2" fy="0.3" fr="0.1">
                <stop offset="0" stop-color="#ffffff"/>
            </radialGradient>
            <radialGradient id="noFocal" cx="0.2" cy="0.8" r="0.5">
                <stop offset="0" stop-color="#ffffff"/>
            </radialGradient>
        `);

        expect(focal.center).toEqual({ x: 0.2, y: 0.3 });
        expect(focal.innerRadius).toBe(0.1);

        expect(noFocal.center).toEqual({ x: 0.2, y: 0.8 });
        expect(noFocal.outerCenter).toEqual({ x: 0.2, y: 0.8 });
    });

    it('should resolve percentage coordinates on both gradient types', () =>
    {
        const { r, l } = parseDefs(`
            <radialGradient id="r" cx="50%" cy="25%" r="50%">
                <stop offset="0" stop-color="#ffffff"/>
            </radialGradient>
            <linearGradient id="l" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0" stop-color="#ffffff"/>
            </linearGradient>
        `);

        expect(r.outerCenter).toEqual({ x: 0.5, y: 0.25 });
        expect(r.outerRadius).toBe(0.5);

        expect(l.start).toEqual({ x: 0, y: 0 });
        expect(l.end).toEqual({ x: 1, y: 0.5 });
    });

    it('should map gradientUnits onto the texture space', () =>
    {
        const { local, global, defaultUnits } = parseDefs(`
            <radialGradient id="local" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#ffffff"/>
            </radialGradient>
            <radialGradient id="global" gradientUnits="userSpaceOnUse" cx="50" cy="50" r="50">
                <stop offset="0" stop-color="#ffffff"/>
            </radialGradient>
            <linearGradient id="defaultUnits">
                <stop offset="0" stop-color="#ffffff"/>
            </linearGradient>
        `);

        expect(local.textureSpace).toBe('local');
        expect(global.textureSpace).toBe('global');
        expect(global.outerCenter).toEqual({ x: 50, y: 50 });
        expect(defaultUnits.textureSpace).toBe('local');
    });

    it('should keep parsing linear gradients as before', () =>
    {
        const { l } = parseDefs(`
            <linearGradient id="l" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ff0000"/>
                <stop offset="0.5" stop-color="#00ff00"/>
                <stop offset="1" stop-color="#0000ff"/>
            </linearGradient>
        `);

        expect(l.type).toBe('linear');
        expect(l.start).toEqual({ x: 0, y: 0 });
        expect(l.end).toEqual({ x: 0, y: 1 });
        expect(l.colorStops.map((stop) => stop.offset)).toEqual([0, 0.5, 1]);
    });
});
