import { Assets } from '../Assets';
import { basePath } from '@test-utils';
import { Texture } from '~/rendering';

describe('loadSVG decimal resolution fix', () =>
{
    beforeEach(() =>
    {
        Assets.reset();
    });

    beforeAll(async () =>
    {
        await Assets.init({
            basePath,
        });
    });

    it('should load SVG with decimal resolution without trimming (issue #11625)', async () =>
    {
        // Test with different SVG strings to avoid caching issues
        const svgString1 = `
            <svg id="test1" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
                <circle cx="25" cy="25" r="25" fill="#fff" />
            </svg>`;

        const svgString2 = `
            <svg id="test2" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
                <circle cx="25" cy="25" r="25" fill="#fff" />
            </svg>`;

        const svgDataURI1 = `data:image/svg+xml;utf8,${encodeURIComponent(svgString1)}`;
        const svgDataURI2 = `data:image/svg+xml;utf8,${encodeURIComponent(svgString2)}`;

        // Test with integer resolution (should work fine)
        const textureInteger = await Assets.load({
            alias: 'test-svg-1',
            src: svgDataURI1,
            data: {
                resolution: 1
            }
        });

        // Test with decimal resolution (this was causing trimming before the fix)
        const textureDecimal = await Assets.load({
            alias: 'test-svg-1.0125',
            src: svgDataURI2,
            data: {
                resolution: 1.0125
            }
        });

        expect(textureInteger).toBeInstanceOf(Texture);
        expect(textureDecimal).toBeInstanceOf(Texture);

        // Both textures should have valid dimensions
        expect(textureInteger.width).toBeGreaterThan(0);
        expect(textureInteger.height).toBeGreaterThan(0);
        expect(textureDecimal.width).toBeGreaterThan(0);
        expect(textureDecimal.height).toBeGreaterThan(0);

        // The decimal resolution texture should have canvas dimensions that are ceiling of the scaled size
        const expectedWidth = Math.ceil(50 * 1.0125);
        const expectedHeight = Math.ceil(50 * 1.0125);

        // The texture source should have the expected resolution
        expect(textureDecimal.source.resolution).toBe(1.0125);

        // The texture source canvas should have dimensions that prevent trimming
        expect(textureDecimal.source.pixelWidth).toBeGreaterThanOrEqual(expectedWidth);
        expect(textureDecimal.source.pixelHeight).toBeGreaterThanOrEqual(expectedHeight);
    });

    it('should handle various decimal resolutions', async () =>
    {
        const testResolutions = [1.0125, 1.03, 1.04, 1.5, 2.3];

        for (let i = 0; i < testResolutions.length; i++)
        {
            const resolution = testResolutions[i];
            // Use unique SVG content to avoid caching
            const svgString = `
                <svg id="test-${i}" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                    <rect width="100" height="100" fill="#ff0000" />
                    <text x="10" y="50">${resolution}</text>
                </svg>`;

            const svgDataURI = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

            const texture = await Assets.load({
                alias: `test-svg-${i}-${resolution}`,
                src: svgDataURI,
                data: { resolution }
            });

            expect(texture).toBeInstanceOf(Texture);
            expect(texture.source.resolution).toBe(resolution);

            // Canvas should be at least the ceiling of scaled dimensions
            const expectedWidth = Math.ceil(100 * resolution);
            const expectedHeight = Math.ceil(100 * resolution);

            expect(texture.source.pixelWidth).toBeGreaterThanOrEqual(expectedWidth);
            expect(texture.source.pixelHeight).toBeGreaterThanOrEqual(expectedHeight);
        }
    });
});
