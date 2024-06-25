import { ExtensionType } from '../../../extensions/Extensions';
import { warn } from '../../../utils/logging/warn';
import { Geometry } from '../shared/geometry/Geometry';
import { Shader } from '../shared/shader/Shader';
import { State } from '../shared/state/State';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { GlProgram } from './shader/GlProgram';

import type { RenderOptions } from '../shared/system/AbstractRenderer';
import type { System } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

const bigTriangleGeometry = new Geometry({
    attributes: {
        aPosition: [
            -1.0, -1.0, // Bottom left corner
            3.0, -1.0, // Bottom right corner, extending beyond right edge
            -1.0, 3.0 // Top left corner, extending beyond top edge
        ],
    },
});

/**
 * The options for the back buffer system.
 * @memberof rendering
 * @property {boolean} [useBackBuffer=false] - if true will use the back buffer where required
 * @property {boolean} [antialias=false] - if true will ensure the texture is antialiased
 */
export interface GlBackBufferOptions
{
    /**
     * if true will use the back buffer where required
     * @default false
     * @memberof rendering.WebGLOptions
     */
    useBackBuffer?: boolean;
    /** if true will ensure the texture is antialiased */
    antialias?: boolean;
}

/**
 * For blend modes you need to know what pixels you are actually drawing to. For this to be possible in WebGL
 * we need to render to a texture and then present that texture to the screen. This system manages that process.
 *
 * As the main scene is rendered to a texture, it means we can sample it and copy its pixels,
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
export class GlBackBufferSystem implements System<GlBackBufferOptions>
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
        /** if true will use the back buffer where required */
        useBackBuffer: false,
    };

    /** if true, the back buffer is used */
    public useBackBuffer = false;

    private _backBufferTexture: Texture;
    private readonly _renderer: WebGLRenderer;
    private _targetTexture: TextureSource;
    private _useBackBufferThisRender = false;
    private _antialias: boolean;
    private _state: State;
    private _bigTriangleShader: Shader;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    public init(options: GlBackBufferOptions = {})
    {
        const { useBackBuffer, antialias } = { ...GlBackBufferSystem.defaultOptions, ...options };

        this.useBackBuffer = useBackBuffer;

        this._antialias = antialias;

        if (!this._renderer.context.supports.msaa)
        {
            warn('antialiasing, is not supported on when using the back buffer');

            this._antialias = false;
        }

        this._state = State.for2d();

        const bigTriangleProgram = new GlProgram({
            vertex: `
                attribute vec2 aPosition;
                out vec2 vUv;

                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);

                    vUv = (aPosition + 1.0) / 2.0;

                    // flip dem UVs
                    vUv.y = 1.0 - vUv.y;
                }`,
            fragment: `
                in vec2 vUv;
                out vec4 finalColor;

                uniform sampler2D uTexture;

                void main() {
                    finalColor = texture(uTexture, vUv);
                }`,
            name: 'big-triangle',
        });

        this._bigTriangleShader = new Shader({
            glProgram: bigTriangleProgram,
            resources: {
                uTexture: Texture.WHITE.source,
            },
        });
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

        renderer.renderTarget.bind(this._targetTexture, false);

        this._bigTriangleShader.resources.uTexture = this._backBufferTexture.source;

        renderer.encoder.draw({
            geometry: bigTriangleGeometry,
            shader: this._bigTriangleShader,
            state: this._state,
        });
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
