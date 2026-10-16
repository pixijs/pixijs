import { TextStyle } from '../../TextStyle';
import { CanvasTextGenerator } from '../CanvasTextGenerator';
import { CanvasTextMetrics } from '../CanvasTextMetrics';
import { fontStringFromTextStyle } from '../utils/fontStringFromTextStyle';

import type { CanvasAndContext } from '~/rendering';

type DrawCall = { y: number, shadowColor: string };

function createRecordingCanvas(width: number, height: number)
{
    const calls: DrawCall[] = [];
    const state: Record<string, any> = {};
    const record = (_text: string, _x: number, y: number) =>
    {
        calls.push({ y, shadowColor: state.shadowColor });
    };
    const methods: Record<string, any> = {
        fillText: record,
        strokeText: record,
        measureText: (text: string) => ({ width: text.length * 10 }),
    };

    const context = new Proxy(state, {
        get: (target, key: string) => methods[key] ?? target[key] ?? ((): undefined => undefined),
        set: (target, key: string, value) =>
        {
            target[key] = value;

            return true;
        },
    });

    return {
        calls,
        canvasAndContext: { canvas: { width, height }, context } as unknown as CanvasAndContext,
    };
}

describe('CanvasTextGenerator', () =>
{
    const fontProperties = { ascent: 80, descent: 20, fontSize: 100 };
    const strokeWidth = 20;

    afterEach(() =>
    {
        CanvasTextMetrics.clearMetrics();
    });

    const createStyle = () => new TextStyle({
        fontSize: 100,
        fill: '#ffffff',
        stroke: { color: '#111111', width: strokeWidth },
        dropShadow: { color: '#000000', alpha: 1, angle: Math.PI / 4, blur: 10, distance: 13 },
    });

    const render = (resolution: number, tagged: boolean) =>
    {
        const style = createStyle();

        CanvasTextMetrics['_fonts'][fontStringFromTextStyle(style)] = fontProperties;

        const padding = style._getFinalPadding();
        const lineHeight = fontProperties.fontSize + strokeWidth;
        const measured = new CanvasTextMetrics(
            'YEAH,', style, 50, lineHeight, ['YEAH,'], [50], lineHeight, 50, fontProperties,
            tagged
                ? {
                    runsByLine: [[{ text: 'YEAH,', style }]],
                    lineAscents: [fontProperties.ascent],
                    lineDescents: [fontProperties.descent],
                    lineHeights: [lineHeight],
                    hasDropShadow: true,
                }
                : undefined
        );
        const height = Math.ceil(Math.ceil(measured.height + (padding * 2)) * resolution);
        const { calls, canvasAndContext } = createRecordingCanvas(100, height);

        CanvasTextGenerator['_renderTextToCanvas'](style, padding, resolution, canvasAndContext, measured);

        const isShadowPass = (call: DrawCall) => call.shadowColor !== 'rgba(0,0,0,0)';

        return {
            shadowPass: calls.filter(isShadowPass),
            textPass: calls.filter((call) => !isShadowPass(call)),
            logicalHeight: height / resolution,
        };
    };

    const cases: Array<[number, boolean]> = [
        [0.25, false],
        [0.35, false],
        [1, false],
        [2, false],
        [0.25, true],
        [2, true],
    ];

    cases.forEach(([resolution, tagged]) =>
    {
        it(`should draw the drop shadow pass text above the canvas at resolution ${resolution} (tagged: ${tagged})`, () =>
        {
            const { shadowPass, textPass, logicalHeight } = render(resolution, tagged);

            expect(shadowPass.length).toBeGreaterThan(0);
            expect(shadowPass.length).toEqual(textPass.length);

            // the context is scaled by the resolution, so the offset is in logical units and
            // must move the hidden copy by at least the logical height of the canvas
            shadowPass.forEach((call, i) =>
            {
                expect(textPass[i].y - call.y).toBeGreaterThanOrEqual(logicalHeight);
            });
        });
    });
});
