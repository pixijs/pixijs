import Shader from '../../shader/Shader';
import Program from '../../shader/Program';
import { BLEND_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { uid } from '@pixi/utils';
// import extractUniformsFromSrc from './extractUniformsFromSrc';
import defaultVertex from './defaultFilter.vert';
import defaultFragment from './defaultFilter.frag';

// let math = require('../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export default class Filter extends Shader
{
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(vertexSrc, fragmentSrc, uniforms)
    {
        const program = Program.from(vertexSrc, fragmentSrc);

        super(program, uniforms);

        this._blendMode = BLEND_MODES.NORMAL;

        this.uniformData = uniforms;
        // || extractUniformsFromSrc(this.vertexSrc, this.fragmentSrc, 'projectionMatrix|uSampler');

        /**
         * An object containing the current values of custom uniforms.
         * @example <caption>Updating the value of a custom uniform</caption>
         * filter.uniforms.time = performance.now();
         *
         * @member {object}
         */
        this.uniforms = {};

        for (const i in this.uniformData)
        {
            this.uniforms[i] = this.uniformData[i].value;
            if (this.uniformData[i].type)
            {
                this.uniformData[i].type = this.uniformData[i].type.toLowerCase();
            }
        }

        // this is where we store shader references..
        // TODO we could cache this!
        this.glShaders = {};

        // used for cacheing.. sure there is a better way!
        if (!Filter.SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc])
        {
            Filter.SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc] = uid();
        }

        this.glShaderKey = Filter.SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc];

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
        this.resolution = settings.RESOLUTION;

        /**
         * If enabled is true the filter is applied, if false it will not.
         *
         * @member {boolean}
         */
        this.enabled = true;

        /**
         * If enabled, PixiJS will fit the filter area into boundaries for better performance.
         * Switch it off if it does not work for specific shader.
         *
         * @member {boolean}
         */
        this.autoFit = true;
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.FilterManager} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTarget} input - The input render target.
     * @param {PIXI.RenderTarget} output - The target to output to.
     * @param {boolean} clear - Should the output be cleared before rendering to it
     * @param {object} [currentState] - It's current state of filter.
     *        There are some useful properties in the currentState :
     *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
     */
    apply(filterManager, input, output, clear, currentState) // eslint-disable-line no-unused-vars
    {
        // do as you please!

        filterManager.applyFilter(this, input, output, clear, currentState);

        // or just do a regular render..
    }

    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode()
    {
        return this._blendMode;
    }

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        this._blendMode = value;
    }

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     */
    static get defaultVertexSrc()
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source
     *
     * @static
     * @constant
     */
    static get defaultFragmentSrc()
    {
        return defaultFragment;
    }
}

/**
 * Used for caching shader IDs
 *
 * @static
 * @private
 */
Filter.SOURCE_KEY_MAP = {};

