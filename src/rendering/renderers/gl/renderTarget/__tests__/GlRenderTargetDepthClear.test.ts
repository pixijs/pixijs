import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { State } from '../../../shared/state/State';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { Graphics, Mesh } from '~/scene';

import type { WebGLRenderer } from '../../WebGLRenderer';

const glShader = {
    vertex: `#version 300 es
        precision highp float;
        in vec2 aPosition;
        uniform float uDepth;
        void main() { gl_Position = vec4(aPosition, uDepth, 1.0); }
    `,
    fragment: `#version 300 es
        precision highp float;
        uniform vec4 uTestColor;
        out vec4 fragColor;
        void main() { fragColor = uTestColor; }
    `,
};

function quad(coords: number[], color: number[], depth: number): Mesh<Geometry, Shader>
{
    const state = new State();

    state.depthTest = true;
    state.depthMask = true;
    state.blendMode = 'none';

    return new Mesh({
        geometry: new Geometry({ attributes: { aPosition: coords } }),
        shader: Shader.from({
            gl: glShader,
            resources: {
                uniforms: {
                    uTestColor: { value: color, type: 'vec4<f32>' },
                    uDepth: { value: depth, type: 'f32' },
                },
            },
        }),
        state,
    });
}

function pixelAt(renderer: WebGLRenderer, texture: Texture, x: number, y: number): number[]
{
    const { pixels } = renderer.extract.pixels(texture);
    const i = ((y * 128) + x) * 4;

    return Array.from(pixels.slice(i, i + 4));
}

describe('GlRenderTargetAdaptor depth clear', () =>
{
    it('should clear the depth buffer even when 2D rendering has disabled depth writes', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 128, height: 128 })) as WebGLRenderer;

        const colorTexture = new Texture({
            source: new TextureSource({
                width: 128, height: 128, resolution: 1, mipLevelCount: 1, autoGenerateMipmaps: false,
            }),
        });
        const renderTarget = new RenderTarget({
            colorTextures: [colorTexture],
            depthStencilTexture: new TextureSource({
                width: 128, height: 128, resolution: 1, format: 'depth24plus-stencil8',
                mipLevelCount: 1, autoGenerateMipmaps: false,
            }),
            depth: true,
            stencil: true,
        });

        // near quad drawn FIRST: if the depth test is broken, paint order would
        // make the far quad win the overlap instead — the test discriminates.
        const near = quad([-1, -1, 0.5, -1, 0.5, 1, -1, -1, 0.5, 1, -1, 1], [0, 0, 1, 1], 0.2);
        const far = quad([-0.5, -1, 1, -1, 1, 1, -0.5, -1, 1, 1, -0.5, 1], [1, 1, 0, 1], 0.8);

        // frame 1: near writes 0.2 into the overlap region's depth
        renderer.render({ target: renderTarget, container: near, clear: true, clearColor: [0, 0, 0, 1] });
        renderer.render({ target: renderTarget, container: far, clear: false });

        expect(pixelAt(renderer, colorTexture, 64, 64)).toEqual([0, 0, 255, 255]); // near wins overlap
        expect(pixelAt(renderer, colorTexture, 120, 64)).toEqual([255, 255, 0, 255]); // far-only region

        // 2D UI pass to screen — State.for2d() leaves gl.depthMask disabled
        renderer.render({ container: new Graphics().rect(0, 0, 10, 10).fill(0x00ffff) });

        // frame 2: the clear must reset frame 1's depth or far is wrongly occluded
        renderer.render({ target: renderTarget, container: far, clear: true, clearColor: [0, 0, 0, 1] });

        expect(pixelAt(renderer, colorTexture, 64, 64)).toEqual([255, 255, 0, 255]);
        expect(pixelAt(renderer, colorTexture, 120, 64)).toEqual([255, 255, 0, 255]);

        renderer.destroy();
    });
});
