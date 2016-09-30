import extractUniformsFromSrc from './extractUniformsFromSrc';
import { uid } from '../../../utils';
import { BLEND_MODES } from '../../../const';

const SOURCE_KEY_MAP = {};

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
class Filter
{
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(vertexSrc, fragmentSrc, uniforms)
    {
        /**
         * The vertex shader.
         *
         * @member {string}
         */
        this.vertexSrc = vertexSrc || Filter.defaultVertexSrc;

        /**
         * The fragment shader.
         *
         * @member {string}
         */
        this.fragmentSrc = fragmentSrc || Filter.defaultFragmentSrc;

        this.blendMode = BLEND_MODES.NORMAL;

        // pull out the vertex and shader uniforms if they are not specified..
        // currently this does not extract structs only default types
        this.uniformData = uniforms || extractUniformsFromSrc(this.vertexSrc, this.fragmentSrc, 'projectionMatrix|uSampler');

        this.uniforms = {};

        for (const i in this.uniformData)
        {
            this.uniforms[i] = this.uniformData[i].value;
        }

        // this is where we store shader references..
        // TODO we could cache this!
        this.glShaders = [];

        // used for cacheing.. sure there is a better way!
        if (!SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc])
        {
            SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc] = uid();
        }

        this.glShaderKey = SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc];

        /**
         * The padding of the filter. Some filters require extra space to breath such as a blur.
         * Increasing this will add extra width and height to the bounds of the object that the
         * filter is applied to.
         *
         * @member {number}
         */
        this.padding = 4;

        /**
         * The resolution of the filter. Setting this to be lower will lower the quality but
         * increase the performance of the filter.
         *
         * @member {number}
         */
        this.resolution = 1;

        /**
         * If enabled is true the filter is applied, if false it will not.
         *
         * @member {boolean}
         */
        this.enabled = true;
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.FilterManager} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTarget} input - The input render target.
     * @param {PIXI.RenderTarget} output - The target to output to.
     * @param {boolean} clear - Should the output be cleared before rendering to it
     */
    apply(filterManager, input, output, clear)
    {
        // --- //
        //  this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(tempMatrix, window.panda );

        // do as you please!

        filterManager.applyFilter(this, input, output, clear);

        // or just do a regular render..
    }

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     */
    static get defaultVertexSrc()
    {
        return [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'uniform mat3 projectionMatrix;',
            'uniform mat3 filterMatrix;',

            'varying vec2 vTextureCoord;',
            'varying vec2 vFilterCoord;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
            '   vTextureCoord = aTextureCoord ;',
            '}',
        ].join('\n');
    }

    /**
     * The default fragment shader source
     *
     * @static
     * @constant
     */
    static get defaultFragmentSrc()
    {
        return [
            'varying vec2 vTextureCoord;',
            'varying vec2 vFilterCoord;',

            'uniform sampler2D uSampler;',
            'uniform sampler2D filterSampler;',

            'void main(void){',
            '   vec4 masky = texture2D(filterSampler, vFilterCoord);',
            '   vec4 sample = texture2D(uSampler, vTextureCoord);',
            '   vec4 color;',
            '   if(mod(vFilterCoord.x, 1.0) > 0.5)',
            '   {',
            '     color = vec4(1.0, 0.0, 0.0, 1.0);',
            '   }',
            '   else',
            '   {',
            '     color = vec4(0.0, 1.0, 0.0, 1.0);',
            '   }',
            // '   gl_FragColor = vec4(mod(vFilterCoord.x, 1.5), vFilterCoord.y,0.0,1.0);',
            '   gl_FragColor = mix(sample, masky, 0.5);',
            '   gl_FragColor *= sample.a;',
            '}',
        ].join('\n');
    }
}

export default Filter;
