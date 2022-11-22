import { Program } from '../shader/Program';
import { Shader } from '../shader/Shader';
import { State } from '../state/State';
import defaultFragment from './defaultFilter.frag';
import defaultVertex from './defaultFilter.vert';
import { MSAA_QUALITY } from '@pixi/constants';

import type { BLEND_MODES, CLEAR_MODES } from '@pixi/constants';
import type { Dict } from '@pixi/utils';
import type { RenderTexture } from '../renderTexture/RenderTexture';
import type { FilterState } from './FilterState';
import type { FilterSystem } from './FilterSystem';

/**
 * A filter is a special shader that applies post-processing effects to an input texture and writes into an output
 * render-target.
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
 * ```js
 * import { Container, Filter } from 'pixi.js';
 * const filter = new Filter(myShaderVert, myShaderFrag, { myUniform: 0.5 });
 * const container = new Container();
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
 * ### Frames
 *
 * The following table summarizes the coordinate spaces used in the filtering pipeline:
 *
 * <table>
 * <thead>
 *   <tr>
 *     <th>Coordinate Space</th>
 *     <th>Description</th>
 *   </tr>
 * </thead>
 * <tbody>
 *   <tr>
 *     <td>Texture Coordinates</td>
 *     <td>
 *         The texture (or UV) coordinates in the input base-texture's space. These are normalized into the (0,1) range along
 *         both axes.
 *     </td>
 *   </tr>
 *   <tr>
 *     <td>World Space</td>
 *     <td>
 *         A point in the same space as the world bounds of any display-object (i.e. in the scene graph's space).
 *     </td>
 *   </tr>
 *   <tr>
 *     <td>Physical Pixels</td>
 *     <td>
 *         This is base-texture's space with the origin on the top-left. You can calculate these by multiplying the texture
 *         coordinates by the dimensions of the texture.
 *     </td>
 *   </tr>
 * </tbody>
 * </table>
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
 * ```js
 * import { Filter } from 'pixi.js';
 * const fragment = `
 * varying vec2 vTextureCoord;
 * uniform sampler2D uSampler;
 * void main(void)
 * {
 *    gl_FragColor = texture2D(uSampler, vTextureCoord);
 * }
 * `;
 *
 * const myFilter = new Filter(null, fragment);
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
 * ```glsl
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
 * ```glsl
 * vec2 filterTextureCoord( void )
 * {
 *     return aVertexPosition * (outputFrame.zw * inputSize.zw); // same as /inputSize.xy
 * }
 * ```
 *
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
 * ```glsl
 * vec4 color = texture2D(uSampler, clamp(modifiedTextureCoord, inputClamp.xy, inputClamp.zw));
 * ```
 *
 * Or:
 *
 * ```glsl
 * vec4 color = texture2D(uSampler, min(modifigedTextureCoord, inputClamp.zw));
 * ```
 *
 * ### Additional Information
 *
 * Complete documentation on Filter usage is located in the
 * {@link https://github.com/pixijs/pixi.js/wiki/v5-Creating-filters Wiki}.
 *
 * Since PixiJS only had a handful of built-in filters, additional filters can be downloaded
 * {@link https://github.com/pixijs/pixi-filters here} from the PixiJS Filters repository.
 * @memberof PIXI
 */
export class Filter extends Shader
{
    /**
     * Default filter resolution for any filter.
     * @static
     */
    public static defaultResolution = 1;

    /**
     * Default filter samples for any filter.
     * @static
     * @type {PIXI.MSAA_QUALITY}
     * @default PIXI.MSAA_QUALITY.NONE
     */
    public static defaultMultisample = MSAA_QUALITY.NONE;

    /**
     * The padding of the filter. Some filters require extra space to breath such as a blur.
     * Increasing this will add extra width and height to the bounds of the object that the
     * filter is applied to.
     */
    public padding: number;

    /** The samples override of the filter instance. */
    public multisample: MSAA_QUALITY;

    /** If enabled is true the filter is applied, if false it will not. */
    public enabled: boolean;

    /**
     * If enabled, PixiJS will fit the filter area into boundaries for better performance.
     * Switch it off if it does not work for specific shader.
     * @default true
     */
    public autoFit: boolean;

    /**
     * Legacy filters use position and uvs from attributes (set by filter system)
     * @readonly
     */
    public legacy: boolean;

    /** The WebGL state the filter requires to render. */
    state: State;

    protected _resolution: number;

    /**
     * @param vertexSrc - The source of the vertex shader.
     * @param fragmentSrc - The source of the fragment shader.
     * @param uniforms - Custom uniforms to use to augment the built-in ones.
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, uniforms?: Dict<any>)
    {
        const program = Program.from(vertexSrc || Filter.defaultVertexSrc,
            fragmentSrc || Filter.defaultFragmentSrc);

        super(program, uniforms);

        this.padding = 0;
        this.resolution = Filter.defaultResolution;
        this.multisample = Filter.defaultMultisample;
        this.enabled = true;
        this.autoFit = true;
        this.state = new State();
    }

    /**
     * Applies the filter
     * @param {PIXI.FilterSystem} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {PIXI.CLEAR_MODES} [clearMode] - Should the output be cleared before rendering to it.
     * @param {object} [_currentState] - It's current state of filter.
     *        There are some useful properties in the currentState :
     *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
     */
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES,
        _currentState?: FilterState): void
    {
        // Do as you please!

        filterManager.applyFilter(this, input, output, clearMode);

        // Or just do a regular render..
    }

    /**
     * Sets the blend mode of the filter.
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES
    {
        return this.state.blendMode;
    }

    set blendMode(value: BLEND_MODES)
    {
        this.state.blendMode = value;
    }

    /**
     * The resolution of the filter. Setting this to be lower will lower the quality but
     * increase the performance of the filter.
     */
    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(value: number)
    {
        this._resolution = value;
    }

    /**
     * The default vertex shader source
     * @constant
     */
    static get defaultVertexSrc(): string
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source
     * @constant
     */
    static get defaultFragmentSrc(): string
    {
        return defaultFragment;
    }

    /** Used for caching shader IDs. */
    static SOURCE_KEY_MAP: Dict<string>;
}
