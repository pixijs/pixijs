import { ExtensionType } from '../../../extensions/Extensions';
import { Shader } from '../shared/shader/Shader';
import { State } from '../shared/state/State';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { GlProgram } from './shader/GlProgram';

import type { RenderSurface } from '../gpu/renderTarget/GpuRenderTargetSystem';
import type { System } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

const bigTriangleProgram = new GlProgram({
    vertex: `
        out vec2 vUv;

        void main() {
            vUv = vec2((gl_VertexID << 1) & 2, (gl_VertexID & 2));

            gl_Position = vec4(vUv * 2.0f + -1.0f, 0.0f, 1.0f);

            // flip dem UVs
            vUv.y = 1.0f - vUv.y;
        }`,
    fragment: `
        in vec2 vUv;
        out vec4 fragColor;

        uniform sampler2D uTexture;

        void main() {
            fragColor = texture(uTexture, vUv);
        }`,
    name: 'big-triangle',
});

const bigTriangleShader = new Shader({
    glProgram: bigTriangleProgram,
    resources: {
        uTexture: Texture.WHITE.source,
    },
});

export class GlBackBufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'backBuffer',
    } as const;

    private _backBufferTexture: Texture;
    private readonly _renderer: WebGLRenderer;
    private _targetTexture: Texture;
    private _useBackBuffer = false;
    private _useBackBufferThisRender = false;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    public init({ useBackBuffer }: { useBackBuffer?: boolean } = {})
    {
        this._useBackBuffer = useBackBuffer;
    }

    protected renderStart({ target, clear }: { target: RenderSurface, clear: boolean })
    {
        this._useBackBufferThisRender = this._useBackBuffer && !!target;

        if (this._useBackBuffer)
        {
            const renderTarget = this._renderer.renderTarget.getRenderTarget(target);

            this._targetTexture = renderTarget.colorTexture;

            target = this._getBackBufferTexture(renderTarget.colorTexture);
        }

        this._renderer.renderTarget.start(target, clear, this._renderer.background.colorRgba);
    }

    protected renderEnd()
    {
        this._presentBackBuffer();
    }

    private _presentBackBuffer()
    {
        const renderer = this._renderer;

        renderer.renderTarget.finishRenderPass();

        if (!this._useBackBufferThisRender) return;

        const gl = renderer.gl;

        renderer.renderTarget.bind(this._targetTexture, false);

        bigTriangleShader.resources.uTexture = this._backBufferTexture.source;

        renderer.shader.bind(bigTriangleShader, false);
        renderer.state.set(State.for2d());

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    private _getBackBufferTexture(targetTexture: Texture)
    {
        const source = targetTexture.source;

        this._backBufferTexture = this._backBufferTexture || new Texture({
            source: new TextureSource({
                width: 1,
                height: 1,
                resolution: 1,
                antialias: false,
            }),
        });

        // this will not resize if its the same size already! No extra check required
        this._backBufferTexture.source.resize(
            source.width,
            source.height,
            source._resolution,
        );

        return this._backBufferTexture;
    }

    public destroy()
    {
        //
    }
}
