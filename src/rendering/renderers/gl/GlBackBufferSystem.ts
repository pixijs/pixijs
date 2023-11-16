import { ExtensionType } from '../../../extensions/Extensions';
import { Shader } from '../shared/shader/Shader';
import { State } from '../shared/state/State';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { GlProgram } from './shader/GlProgram';

import type { RenderOptions } from '../shared/system/AbstractRenderer';
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

/** The options for the back buffer system. */
export interface GlBackBufferOptions
{
    /** if true will use the back buffer where required */
    useBackBuffer?: boolean;
    /** if true will ensure the texture is antialiased */
    antialias?: boolean;
}

/**
 * For blend modes you need to know what pixels you are actually drawing to. For this to be possible in WebGL
 * we need to render to a texture and then present that texture to the screen. This system manages that process.
 *
 * As the main scene is rendered to a texture, it means we can sample it anc copy its pixels,
 * something not possible on the main canvas.
 *
 * If antialiasing is set to to true and useBackBuffer is set to true, then the back buffer will be antialiased.
 * and the main gl context will not.
 *
 * You only need to activate this back buffer if you are using a blend mode that requires it.
 *
 * to activate is simple, you pass `useBackBuffer:true` to your render options
 * @memberof rendering
 */
export class GlBackBufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'backBuffer',
        priority: 1
    } as const;

    /** default options for the back buffer system */
    public static defaultOptions: GlBackBufferOptions = {
        useBackBuffer: false,
    };

    /** if true, the back buffer is used */
    public useBackBuffer = false;

    private _backBufferTexture: Texture;
    private readonly _renderer: WebGLRenderer;
    private _targetTexture: TextureSource;
    private _useBackBufferThisRender = false;
    private _antialias: boolean;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    public init(options: GlBackBufferOptions = {})
    {
        const { useBackBuffer, antialias } = { ...GlBackBufferSystem.defaultOptions, ...options };

        this.useBackBuffer = useBackBuffer;
        this._antialias = antialias;
    }

    /**
     * This is called before the RenderTargetSystem is started. This is where
     * we replace the target with the back buffer if required.
     * @param options - The options for this render.
     */
    protected renderStart(options: RenderOptions)
    {
        const renderTarget = this._renderer.renderTarget.getRenderTarget(options.target);

        this._useBackBufferThisRender = this.useBackBuffer && !!renderTarget.isRoot;

        if (this._useBackBufferThisRender)
        {
            const renderTarget = this._renderer.renderTarget.getRenderTarget(options.target);

            this._targetTexture = renderTarget.colorTexture;

            options.target = this._getBackBufferTexture(renderTarget.colorTexture);
        }
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

    private _getBackBufferTexture(targetSourceTexture: TextureSource)
    {
        this._backBufferTexture = this._backBufferTexture || new Texture({
            source: new TextureSource({
                width: targetSourceTexture.width,
                height: targetSourceTexture.height,
                resolution: targetSourceTexture._resolution,
                antialias: this._antialias,
            }),
        });

        // this will not resize if its the same size already! No extra check required
        this._backBufferTexture.source.resize(
            targetSourceTexture.width,
            targetSourceTexture.height,
            targetSourceTexture._resolution,
        );

        return this._backBufferTexture;
    }

    /** destroys the back buffer */
    public destroy()
    {
        if (this._backBufferTexture)
        {
            this._backBufferTexture.destroy();
            this._backBufferTexture = null;
        }
    }
}
