import { Shader } from '../shader/Shader';
import { Program } from '../shader/Program';
import { State } from '../state/State';
import { settings } from '@pixi/settings';
import defaultVertex from './defaultFilter.vert';
import defaultFragment from './defaultFilter.frag';

import { RenderTexture } from '@pixi/core';
import { FilterSystem } from './FilterSystem';
import { FilterState } from './FilterState';
import {
    BLEND_MODES,
    CLEAR_MODES,
    FILTER_OUTPUT_MODES,
    FILTER_INPUT_MODES,
    FILTER_TARGET_MODES,
} from '@pixi/constants';
import { Rectangle } from '@pixi/math';

/**
 * Filter is a special type of WebGL shader that is applied to the screen.
 *
 * {@link http://pixijs.io/examples/#/filters/blur-filter.js Example} of the
 * {@link PIXI.filters.BlurFilter BlurFilter}.
 *
 * ### Usage
 * Filters can be applied to any DisplayObject or Container.
 * PixiJS' `FilterSystem` renders the container into temporary Framebuffer,
 * then filter renders it to the screen.
 * Multiple filters can be added to the `filters` array property and stacked on each other.
 *
 * ```
 * const filter = new PIXI.Filter(myShaderVert, myShaderFrag, { myUniform: 0.5 });
 * const container = new PIXI.Container();
 * container.filters = [filter];
 * ```
 *
 * ### Previous Version Differences
 *
 * In PixiJS **v3**, a filter was always applied to _whole screen_.
 *
 * In PixiJS **v4**, a filter can be applied _only part of the screen_.
 * Developers had to create a set of uniforms to deal with coordinates.
 *
 * In PixiJS **v5** combines _both approaches_.
 * Developers can use normal coordinates of v3 and then allow filter to use partial Framebuffers,
 * bringing those extra uniforms into account.
 *
 * Also be aware that we have changed default vertex shader, please consult
 * {@link https://github.com/pixijs/pixi.js/wiki/v5-Creating-filters Wiki}.
 *
 * ### Built-in Uniforms
 *
 * PixiJS viewport uses screen (CSS) coordinates, `(0, 0, renderer.screen.width, renderer.screen.height)`,
 * and `projectionMatrix` uniform maps it to the gl viewport.
 *
 * **uSampler**
 *
 * The most important uniform is the input texture that container was rendered into.
 * _Important note: as with all Framebuffers in PixiJS, both input and output are
 * premultiplied by alpha._
 *
 * By default, input normalized coordinates are passed to fragment shader with `vTextureCoord`.
 * Use it to sample the input.
 *
 * ```
 * const fragment = `
 * varying vec2 vTextureCoord;
 * uniform sampler2D uSampler;
 * void main(void)
 * {
 *    gl_FragColor = texture2D(uSampler, vTextureCoord);
 * }
 * `;
 *
 * const myFilter = new PIXI.Filter(null, fragment);
 * ```
 *
 * This filter is just one uniform less than {@link PIXI.filters.AlphaFilter AlphaFilter}.
 *
 * **outputFrame**
 *
 * The `outputFrame` holds the rectangle where filter is applied in screen (CSS) coordinates.
 * It's the same as `renderer.screen` for a fullscreen filter.
 * Only a part of  `outputFrame.zw` size of temporary Framebuffer is used,
 * `(0, 0, outputFrame.width, outputFrame.height)`,
 *
 * Filters uses this quad to normalized (0-1) space, its passed into `aVertexPosition` attribute.
 * To calculate vertex position in screen space using normalized (0-1) space:
 *
 * ```
 * vec4 filterVertexPosition( void )
 * {
 *     vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
 *     return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
 * }
 * ```
 *
 * **inputSize**
 *
 * Temporary framebuffer is different, it can be either the size of screen, either power-of-two.
 * The `inputSize.xy` are size of temporary framebuffer that holds input.
 * The `inputSize.zw` is inverted, it's a shortcut to evade division inside the shader.
 *
 * Set `inputSize.xy = outputFrame.zw` for a fullscreen filter.
 *
 * To calculate input normalized coordinate, you have to map it to filter normalized space.
 * Multiply by `outputFrame.zw` to get input coordinate.
 * Divide by `inputSize.xy` to get input normalized coordinate.
 *
 * ```
 * vec2 filterTextureCoord( void )
 * {
 *     return aVertexPosition * (outputFrame.zw * inputSize.zw); // same as /inputSize.xy
 * }
 * ```
 * **resolution**
 *
 * The `resolution` is the ratio of screen (CSS) pixels to real pixels.
 *
 * **inputPixel**
 *
 * `inputPixel.xy` is the size of framebuffer in real pixels, same as `inputSize.xy * resolution`
 * `inputPixel.zw` is inverted `inputPixel.xy`.
 *
 * It's handy for filters that use neighbour pixels, like {@link PIXI.filters.FXAAFilter FXAAFilter}.
 *
 * **inputClamp**
 *
 * If you try to get info from outside of used part of Framebuffer - you'll get undefined behaviour.
 * For displacements, coordinates has to be clamped.
 *
 * The `inputClamp.xy` is left-top pixel center, you may ignore it, because we use left-top part of Framebuffer
 * `inputClamp.zw` is bottom-right pixel center.
 *
 * ```
 * vec4 color = texture2D(uSampler, clamp(modifigedTextureCoord, inputClamp.xy, inputClamp.zw))
 * ```
 * OR
 * ```
 * vec4 color = texture2D(uSampler, min(modifigedTextureCoord, inputClamp.zw))
 * ```
 *
 * ### Additional Information
 *
 * Complete documentation on Filter usage is located in the
 * {@link https://github.com/pixijs/pixi.js/wiki/v5-Creating-filters Wiki}.
 *
 * Since PixiJS only had a handful of built-in filters, additional filters can be downloaded
 * {@link https://github.com/pixijs/pixi-filters here} from the PixiJS Filters repository.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export class Filter extends Shader
{
    public padding: number;
    public resolution: number;
    public enabled: boolean;
    public autoFit: boolean;
    public legacy: boolean;
    state: State;

    public targetMode: FILTER_TARGET_MODES;
    protected inputMode: FILTER_INPUT_MODES;
    protected outputMode: FILTER_OUTPUT_MODES;

    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, uniforms?: {[key: string]: any})
    {
        const program = Program.from(vertexSrc || Filter.defaultVertexSrc,
            fragmentSrc || Filter.defaultFragmentSrc);

        super(program, uniforms);

        /**
         * The padding of the filter. Some filters require extra space to breath such as a blur.
         * Increasing this will add extra width and height to the bounds of the object that the
         * filter is applied to.
         *
         * @member {number}
         */
        this.padding = 0;

        /**
         * The resolution of the filter. Setting this to be lower will lower the quality but
         * increase the performance of the filter.
         *
         * @member {number}
         */
        this.resolution = settings.FILTER_RESOLUTION;

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

        /**
         * Legacy filters use position and uvs from attributes
         * @member {boolean}
         * @readonly
         */
        this.legacy = !!this.program.attributeData.aTextureCoord;

        /**
         * The WebGL state the filter requires to render
         * @member {PIXI.State}
         */
        this.state = new State();

        /**
         * Specifies how to resolve target-in frame.
         * @member {PIXI.FILTER_TARGET_MODES}
         * @default FILTER_TARGET_MODES.INPUT_FRAME
         */
        this.targetMode = FILTER_TARGET_MODES.INPUT_FRAME;

        /**
         * Supply a way to calculate target-in frame without overriding `onMeasureInput`.
         * @member {PIXI.FILTER_INPUT_MODES}
         * @default FILTER_INPUT_MODES.PASS_THROUGH
         * @protected
         */
        this.inputMode = FILTER_INPUT_MODES.PASS_THROUGH;

        /**
         * Supply a way to calculate target-out frame without overriding `onMeasureOutput`.
         * @member {PIXI.FILTER_OUTPUT_MODES}
         * @default FILTER_OUTPUT_MODES.PAD
         * @protected
         */
        this.outputMode = FILTER_OUTPUT_MODES.PAD;
    }

    /**
     * Calculates the target-out frame, given a fixed target-in frame.
     *
     * This is useful for filters like blurs which sort of spread their contents outside of
     * the input.
     *
     * @param {PIXI.Rectangle} targetInFrame - frame on which the filter's effects are applied
     * @returns {PIXI.Rectangle} - frame in which the filter will output.
     */
    onMeasureOutput(targetInFrame: Rectangle): Rectangle
    {
        switch (this.outputMode)
        {
            case FILTER_OUTPUT_MODES.PAD:
                return targetInFrame.pad(this.padding);
            default:
                return targetInFrame;
        }
    }

    /**
     * Calculate the size of the input needed to output.
     *
     * @param {PIXI.Rectangle} targetOutputFrame - frame in which filter will get to write
     * @param {PIXI.Rectangle} wholeTargetInFrame - original target-in frame
     * @returns {PIXI.Rectangle} - frame that the filter needs in order to write into target-out
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMeasureInput(partialTargetOutFrame: Rectangle, _wholeTargetInFrame: Rectangle): Rectangle
    {
        switch (this.inputMode)
        {
            case FILTER_INPUT_MODES.PAD:
                return partialTargetOutFrame.pad(this.padding);
            case FILTER_INPUT_MODES.PASS_THROUGH:
                return partialTargetOutFrame;
            default:
                return partialTargetOutFrame;
        }
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {PIXI.CLEAR_MODES} clearMode - Should the output be cleared before rendering to it.
     * @param {object} [currentState] - It's current state of filter.
     *        There are some useful properties in the currentState :
     *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
     */
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _currentState?: FilterState): void
    {
        // do as you please!

        filterManager.applyFilter(this, input, output, clearMode);

        // or just do a regular render..
    }

    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES
    {
        return this.state.blendMode;
    }

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        this.state.blendMode = value;
    }

    /**
     * The default vertex shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultVertexSrc(): string
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultFragmentSrc(): string
    {
        return defaultFragment;
    }

    /**
     * Used for caching shader IDs
     *
     * @static
     * @type {object}
     * @protected
     */
    static SOURCE_KEY_MAP: {[key: string]: string};
}
