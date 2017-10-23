import * as core from '../../core';
import { WRAP_MODES } from '../../core/const';
import { readFileSync } from 'fs';
import { join } from 'path';

const tempMat = new core.Matrix();

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI.extras
 * @extends PIXI.ObjectRenderer
 */
export default class TilingSpriteRenderer extends core.ObjectRenderer
{

    /**
     * constructor for renderer
     *
     * @param {WebGLRenderer} renderer The renderer this tiling awesomeness works for.
     */
    constructor(renderer)
    {
        super(renderer);

        const uniforms = { globals: this.renderer.globalUniforms };

        this.shader = new core.Shader.from(
            readFileSync(join(__dirname, './tilingSprite.vert'), 'utf8'),
            readFileSync(join(__dirname, './tilingSprite.frag'), 'utf8'),
            uniforms);

        this.simpleShader = new core.Shader.from(
            readFileSync(join(__dirname, './tilingSprite.vert'), 'utf8'),
            readFileSync(join(__dirname, './tilingSprite_simple.frag'), 'utf8'),
            uniforms);

        this.quad = new core.Quad();
    }

    /**
     *
     * @param {PIXI.extras.TilingSprite} ts tilingSprite to be rendered
     */
    render(ts)
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

        const tex = ts._texture;
        const baseTex = tex.baseTexture;
        const lt = ts.tileTransform.localTransform;
        const uv = ts.uvTransform;
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
        shader.uniforms.uColor = core.utils.premultiplyTintToRgba(ts.tint, ts.worldAlpha,
            shader.uniforms.uColor, baseTex.premultiplyAlpha);
        shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
        shader.uniforms.uSampler = tex;

        renderer.shader.bind(shader);
        renderer.geometry.bind(quad);// , renderer.shader.getGLShader());

        renderer.setBlendMode(core.utils.correctBlendMode(ts.blendMode, baseTex.premultiplyAlpha));
        renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
    }
}

core.WebGLRenderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
