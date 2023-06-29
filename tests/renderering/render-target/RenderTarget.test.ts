import { isRenderingToScreen } from '../../../src/rendering/renderers/shared/renderTarget/isRenderingToScreen';
import { RenderTarget } from '../../../src/rendering/renderers/shared/renderTarget/RenderTarget';
import { CanvasSource } from '../../../src/rendering/renderers/shared/texture/sources/CanvasSource';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';

import type { ICanvas } from '../../../src/settings/adapter/ICanvas';

function makeTextureFromResource(resource: HTMLCanvasElement)
{
    return new Texture({
        source: new CanvasSource({
            resource: (resource as ICanvas),
        }),
    });
}

describe('isRenderingToScreen', () =>
{
    it('returns true for a canvas attached to the dom', () =>
    {
        const canvas = document.createElement('canvas');

        document.body.appendChild(canvas);

        const renderTarget = new RenderTarget({
            colorTextures: [
                makeTextureFromResource(canvas)
            ]
        });

        expect(isRenderingToScreen(renderTarget)).toBe(true);
    });

    it('returns false for canvas not attached to the dom', () =>
    {
        const canvas = document.createElement('canvas');

        const renderTarget = new RenderTarget({
            colorTextures: [
                makeTextureFromResource(canvas)
            ]
        });

        expect(isRenderingToScreen(renderTarget)).toBe(false);
    });

    it('returns false if the texture is not a canvas', () =>
    {
        const renderTarget = new RenderTarget({
            colorTextures: [
                Texture.EMPTY
            ]
        });

        expect(isRenderingToScreen(renderTarget)).toBe(false);
    });
});
