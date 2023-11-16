import { Rectangle } from '../../../src/maths/shapes/Rectangle';
import { isRenderingToScreen } from '../../../src/rendering/renderers/shared/renderTarget/isRenderingToScreen';
import { RenderTarget } from '../../../src/rendering/renderers/shared/renderTarget/RenderTarget';
import { CanvasSource } from '../../../src/rendering/renderers/shared/texture/sources/CanvasSource';
import { TextureSource } from '../../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { getRenderer } from '../../utils/getRenderer';

import type { ICanvas } from '../../../src/environment/canvas/ICanvas';

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

    it('render target should push and pop correctly', async () =>
    {
        const renderer = await getRenderer();

        const sourceTexture = new TextureSource({
            width: 32,
            height: 32
        });

        const renderTarget = renderer.renderTarget.push(sourceTexture);

        expect(renderer.renderTarget.projectionMatrix.toArray()).toEqual(
            new Float32Array([0.0625, 0, -1, 0, 0.0625, -1, 0, 0, 1])
        );

        renderer.renderTarget.push(sourceTexture, false, null, new Rectangle(0, 0, 16, 16));

        expect(renderer.renderTarget.projectionMatrix.toArray()).toEqual(
            new Float32Array([0.00390625, 0, -1, 0, 0.00390625, -1, 0, 0, 1])
        );

        renderer.renderTarget.pop();

        expect(renderer.renderTarget.renderTarget).toBe(renderTarget);

        expect(renderer.renderTarget.projectionMatrix.toArray()).toEqual(
            new Float32Array([0.0625, 0, -1, 0, 0.0625, -1, 0, 0, 1])
        );
    }),

    it('root render target should have negative projection matrix in WebGL', async () =>
    {
        const renderer = await getRenderer({
            width: 32,
            height: 32,
        });

        const sourceTexture = new TextureSource({
            width: 32,
            height: 32
        });

        renderer.renderTarget.bind(sourceTexture, true);

        expect(renderer.renderTarget.projectionMatrix.toArray()).toEqual(
            new Float32Array([0.0625, 0, -1, 0, 0.0625, -1, 0, 0, 1])
        );
        // the canvas..
        renderer.renderTarget.bind(renderer.view.texture, true);

        // now it should be the same matrix with y inverted
        expect(renderer.renderTarget.projectionMatrix.toArray()).toEqual(
            new Float32Array([0.0625, 0, -1, 0, -0.0625, 1, 0, 0, 1])
        );
    }),

    it('render target system should use same render target for shared texture sources', async () =>
    {
        const renderer = await getRenderer();

        const sourceTexture = new TextureSource({
            width: 32,
            height: 32
        });

        const renderTextureTopLeft = new Texture({
            source: sourceTexture,
            frame: new Rectangle(
                0, 0,
                16, 16
            )
        });

        const renderTextureBottomRight = new Texture({
            source: sourceTexture,
            frame: new Rectangle(
                16, 16,
                16, 16
            )
        });

        const renderTargetTopLeft = renderer.renderTarget.bind(renderTextureTopLeft);
        const renderTargetBottomRight = renderer.renderTarget.bind(renderTextureBottomRight);

        expect(renderTargetTopLeft).toBe(renderTargetBottomRight);
    });
});
