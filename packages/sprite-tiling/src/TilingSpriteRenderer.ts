import { ObjectRenderer, Shader, State, QuadUv, ExtensionType, WRAP_MODES, Matrix, utils, extensions } from '@pixi/core';

import fragmentSimpleSrc from './sprite-tiling-simple.frag';
import gl1VertexSrc from './sprite-tiling-fallback.vert';
import gl1FragmentSrc from './sprite-tiling-fallback.frag';
import gl2VertexSrc from './sprite-tiling.vert';
import gl2FragmentSrc from './sprite-tiling.frag';

import type { Renderer, ExtensionMetadata } from '@pixi/core';
import type { TilingSprite } from './TilingSprite';

const tempMat = new Matrix();

/**
 * WebGL renderer plugin for tiling sprites
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export class TilingSpriteRenderer extends ObjectRenderer
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'tilingSprite',
        type: ExtensionType.RendererPlugin,
    };

    public shader: Shader;
    public simpleShader: Shader;
    public quad: QuadUv;
    public readonly state: State;

    /**
     * constructor for renderer
     * @param {PIXI.Renderer} renderer - The renderer this tiling awesomeness works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        // WebGL version is not available during initialization!
        renderer.runners.contextChange.add(this);

        this.quad = new QuadUv();

        /**
         * The WebGL state in which this renderer will work.
         * @member {PIXI.State}
         * @readonly
         */
        this.state = State.for2d();
    }

    /** Creates shaders when context is initialized. */
    contextChange(): void
    {
        const renderer = this.renderer;
        const uniforms = { globals: renderer.globalUniforms };

        this.simpleShader = Shader.from(gl1VertexSrc, fragmentSimpleSrc, uniforms);
        this.shader = renderer.context.webGLVersion > 1
            ? Shader.from(gl2VertexSrc, gl2FragmentSrc, uniforms)
            : Shader.from(gl1VertexSrc, gl1FragmentSrc, uniforms);
    }

    /**
     * @param {PIXI.TilingSprite} ts - tilingSprite to be rendered
     */
    public render(ts: TilingSprite): void
    {
        const renderer = this.renderer;
        const quad = this.quad;

        let vertices = quad.vertices;

        vertices[0] = vertices[6] = (ts._width) * -ts.anchor.x;
        vertices[1] = vertices[3] = ts._height * -ts.anchor.y;

        vertices[2] = vertices[4] = (ts._width) * (1.0 - ts.anchor.x);
        vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);

        const anchorX = ts.uvRespectAnchor ? ts.anchor.x : 0;
        const anchorY = ts.uvRespectAnchor ? ts.anchor.y : 0;

        vertices = quad.uvs;

        vertices[0] = vertices[6] = -anchorX;
        vertices[1] = vertices[3] = -anchorY;

        vertices[2] = vertices[4] = 1.0 - anchorX;
        vertices[5] = vertices[7] = 1.0 - anchorY;

        quad.invalidate();

        const tex = ts._texture;
        const baseTex = tex.baseTexture;
        const premultiplied = baseTex.alphaMode > 0;
        const lt = ts.tileTransform.localTransform;
        const uv = ts.uvMatrix;
        let isSimple = baseTex.isPowerOfTwo
            && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

        // auto, force repeat wrapMode for big tiling textures
        if (isSimple)
        {
            if (!baseTex._glTextures[renderer.CONTEXT_UID])
            {
                if (baseTex.wrapMode === WRAP_MODES.CLAMP)
                {
                    baseTex.wrapMode = WRAP_MODES.REPEAT;
                }
            }
            else
            {
                isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
            }
        }

        const shader = isSimple ? this.simpleShader : this.shader;

        const w = tex.width;
        const h = tex.height;
        const W = ts._width;
        const H = ts._height;

        tempMat.set(lt.a * w / W,
            lt.b * w / H,
            lt.c * h / W,
            lt.d * h / H,
            lt.tx / W,
            lt.ty / H);

        // that part is the same as above:
        // tempMat.identity();
        // tempMat.scale(tex.width, tex.height);
        // tempMat.prepend(lt);
        // tempMat.scale(1.0 / ts._width, 1.0 / ts._height);

        tempMat.invert();
        if (isSimple)
        {
            tempMat.prepend(uv.mapCoord);
        }
        else
        {
            shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
            shader.uniforms.uClampFrame = uv.uClampFrame;
            shader.uniforms.uClampOffset = uv.uClampOffset;
        }

        shader.uniforms.uTransform = tempMat.toArray(true);
        shader.uniforms.uColor = utils.premultiplyTintToRgba(ts.tint, ts.worldAlpha,
            shader.uniforms.uColor, premultiplied);
        shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
        shader.uniforms.uSampler = tex;

        renderer.shader.bind(shader);
        renderer.geometry.bind(quad);

        this.state.blendMode = utils.correctBlendMode(ts.blendMode, premultiplied);
        renderer.state.set(this.state);
        renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
    }
}

extensions.add(TilingSpriteRenderer);
