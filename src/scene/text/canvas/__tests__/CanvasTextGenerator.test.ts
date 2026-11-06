import '~/environment-browser/browserAll';
import { TextStyle } from '../../TextStyle';
import { CanvasTextGenerator } from '../CanvasTextGenerator';

function getFirstOpaqueRow(canvas: HTMLCanvasElement): number
{
    const context = canvas.getContext('2d');
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < height; y++)
    {
        const rowStart = y * width;

        for (let x = 0; x < width; x++)
        {
            const pixelStart = (rowStart + x) * 4;

            if (data[pixelStart + 3] !== 0) return y;
        }
    }

    return height;
}

function getCanvas(text: string, style: TextStyle, resolution: number): HTMLCanvasElement
{
    const { canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({ text, style, resolution });
    const canvas = canvasAndContext.canvas as HTMLCanvasElement;

    const result = document.createElement('canvas');

    result.width = canvas.width;
    result.height = canvas.height;
    result.getContext('2d').drawImage(canvas, 0, 0);

    CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);

    return result;
}

function expectNoShadowLeak(text: string, style: TextStyle, resolution: number): void
{
    const shadowCanvas = getCanvas(text, style, resolution);

    style.dropShadow = null;

    const noShadowCanvas = getCanvas(text, style, resolution);
    const firstOpaqueRow = getFirstOpaqueRow(noShadowCanvas);
    const shadowContext = shadowCanvas.getContext('2d');
    const { data } = shadowContext.getImageData(0, 0, shadowCanvas.width, firstOpaqueRow);

    let leakedPixels = 0;

    for (let i = 3; i < data.length; i += 4)
    {
        if (data[i] !== 0) leakedPixels++;
    }

    expect(leakedPixels).toBe(0);
}

describe('CanvasTextGenerator', () =>
{
    it.each([0.25, 0.35, 1, 2])('does not leak the shadow text above the glyphs at resolution %p', (resolution) =>
    {
        expect.assertions(1);

        const createStyle = (dropShadow: TextStyle['dropShadow']) => new TextStyle({
            fontFamily: 'Arial',
            fontSize: 96,
            fontWeight: '900',
            fontStyle: 'italic',
            fill: '#ffffff',
            stroke: { color: '#111111', width: 19 },
            dropShadow,
        });
        const style = createStyle({
            color: '#000000',
            alpha: 1,
            angle: Math.PI / 4,
            blur: 10,
            distance: 13,
        });

        expectNoShadowLeak('YEAH,', style, resolution);
    });

    it.each([0.25, 0.35, 1, 2])('does not leak tagged shadow text above the glyphs at resolution %p', (resolution) =>
    {
        expect.assertions(1);

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 96,
            fontWeight: '900',
            fontStyle: 'italic',
            fill: '#ffffff',
            stroke: { color: '#111111', width: 19 },
            dropShadow: {
                color: '#000000',
                alpha: 1,
                angle: Math.PI / 4,
                blur: 10,
                distance: 13,
            },
            tagStyles: {
                shadowed: {},
            },
        });

        expectNoShadowLeak('<shadowed>YEAH,</shadowed>', style, resolution);
    });
});
