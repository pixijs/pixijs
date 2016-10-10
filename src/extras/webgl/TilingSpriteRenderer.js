import * as core from '../../core';
import { WRAP_MODES } from '../../core/const';

const glslify = require('glslify'); // eslint-disable-line no-undef

const tempMat = new core.Matrix();
const tempArray = new Float32Array(4);

/**
 * WebGL renderer plugin for tiling sprites
 */
export class TilingSpriteRenderer extends core.ObjectRenderer {

    /**
     * constructor for renderer
     *
     * @param {WebGLRenderer} renderer The renderer this tiling awesomeness works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.shader = null;
        this.simpleShader = null;
        this.quad = null;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    onContextChange()
    {
        const gl = this.renderer.gl;

        this.shader = new core.Shader(gl,
            glslify('./tilingSprite.vert'),
            glslify('./tilingSprite.frag'));
        this.simpleShader = new core.Shader(gl,
            glslify('./tilingSprite.vert'),
            glslify('./tilingSprite_simple.frag'));

        this.quad = new core.Quad(gl);
        this.quad.initVao(this.shader);
    }

    /**
     * whether or not tilingSprite can be drawn without transforms and clamps in fragment shader
     *
     * @param {TilingSprite} ts tiling sprite
     * @returns {boolean} whether or not its simple
     */
    isSimpleSprite(ts)
    {
        const renderer = this.renderer;
        const tex = ts._texture;
        const baseTex = tex.baseTexture;
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

        return isSimple;
    }

    /**
     * For extra pixi plugins use
     *
     * @param {PIXI.TilingSprite} ts tiling sprite
     * @param {boolean} isSimple is it repeating texture or not
     * @param {PIXI.Shader} shader, must be set accordingly to isSimple
     */
    renderWithShader(ts, isSimple, shader)
    {
        const quad = this.quad;
        let vertices = quad.vertices;

        vertices[0] = vertices[6] = (ts._width) * -ts.anchor.x;
        vertices[1] = vertices[3] = ts._height * -ts.anchor.y;

        vertices[2] = vertices[4] = (ts._width) * (1.0 - ts.anchor.x);
        vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);

        vertices = quad.uvs;

        vertices[0] = vertices[6] = -ts.anchor.x;
        vertices[1] = vertices[3] = -ts.anchor.y;

        vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
        vertices[5] = vertices[7] = 1.0 - ts.anchor.y;

        quad.upload();

        const renderer = this.renderer;
        const tex = ts._texture;
        const lt = ts.tileTransform.localTransform;
        const uv = ts.uvTransform;

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
            tempMat.append(uv.mapCoord);
        }
        else
        {
            shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
            shader.uniforms.uClampFrame = uv.uClampFrame;
            shader.uniforms.uClampOffset = uv.uClampOffset;
        }
        shader.uniforms.uTransform = tempMat.toArray(true);

        const color = tempArray;
        const alpha = ts.worldAlpha;

        core.utils.hex2rgb(ts.tint, color);
        color[0] *= alpha;
        color[1] *= alpha;
        color[2] *= alpha;
        color[3] = alpha;
        shader.uniforms.uColor = color;
        shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);

        renderer.bindTexture(tex);

        quad.draw();
    }

    /**
     * render method
     *
     * @param {PIXI.extras.TilingSprite} ts tilingSprite to be rendered
     */
    render(ts)
    {
        const renderer = this.renderer;
        const isSimple = this.isSimpleSprite(ts);
        const shader = isSimple ? this.simpleShader : this.shader;

        renderer.bindShader(shader);
        renderer.setBlendMode(ts.blendMode);
        this.renderWithShader(ts, isSimple, shader);
    }
}

core.WebGLRenderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
