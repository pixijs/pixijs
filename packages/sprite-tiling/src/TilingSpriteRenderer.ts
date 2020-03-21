import { ObjectRenderer, Shader, State, QuadUv } from '@pixi/core';
import { WRAP_MODES } from '@pixi/constants';
import { Matrix } from '@pixi/math';
import { premultiplyTintToRgba, correctBlendMode } from '@pixi/utils';

import vertex from './tilingSprite.vert';
import fragment from './tilingSprite.frag';
import fragmentSimple from './tilingSprite_simple.frag';

import type { Renderer } from '@pixi/core';
import type { TilingSprite } from './TilingSprite';

const tempMat = new Matrix();

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export class TilingSpriteRenderer extends ObjectRenderer
{
    public shader: Shader;
    public simpleShader: Shader;
    public quad: QuadUv;
    public readonly state: State;

    /**
     * constructor for renderer
     *
     * @param {PIXI.Renderer} renderer The renderer this tiling awesomeness works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        const uniforms = { globals: this.renderer.globalUniforms };

        this.shader = Shader.from(vertex, fragment, uniforms);

        this.simpleShader = Shader.from(vertex, fragmentSimple, uniforms);

        this.quad = new QuadUv();

        /**
         * The WebGL state in which this renderer will work.
         *
         * @member {PIXI.State}
         * @readonly
         */
        this.state = State.for2d();
    }

    /**
     *
     * @param {PIXI.TilingSprite} ts tilingSprite to be rendered
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

        if (ts.uvRespectAnchor)
        {
            vertices = quad.uvs;

            vertices[0] = vertices[6] = -ts.anchor.x;
            vertices[1] = vertices[3] = -ts.anchor.y;

            vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
            vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
        }

        quad.invalidate();

        const tex = ts._texture;
        const baseTex = tex.baseTexture;
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
        shader.uniforms.uColor = premultiplyTintToRgba(ts.tint, ts.worldAlpha,
            shader.uniforms.uColor, baseTex.alphaMode as any);
        shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
        shader.uniforms.uSampler = tex;

        renderer.shader.bind(shader);
        renderer.geometry.bind(quad);

        this.state.blendMode = correctBlendMode(ts.blendMode, baseTex.alphaMode as any);
        renderer.state.set(this.state);
        renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
    }
}
