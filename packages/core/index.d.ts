import { ALPHA_MODES } from '@pixi/constants';
import type { ArrayFixed } from '@pixi/utils';
import type { BaseTexture as BaseTexture_2 } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { BUFFER_BITS } from '@pixi/constants';
import { CLEAR_MODES } from '@pixi/constants';
import type { Dict } from '@pixi/utils';
import { DisplayObject } from '@pixi/display';
import { DRAW_MODES } from '@pixi/constants';
import { EventEmitter } from '@pixi/utils';
import type { Extract as Extract_2 } from '@pixi/extract';
import { FORMATS } from '@pixi/constants';
import type { IPointData } from '@pixi/math';
import { ISize } from '@pixi/math';
import { MASK_TYPES } from '@pixi/constants';
import { Matrix } from '@pixi/math';
import { MIPMAP_MODES } from '@pixi/constants';
import { MSAA_QUALITY } from '@pixi/constants';
import { Point } from '@pixi/math';
import { Rectangle } from '@pixi/math';
import { RENDERER_TYPE } from '@pixi/constants';
import { Runner } from '@pixi/runner';
import { SCALE_MODES } from '@pixi/constants';
import { TARGETS } from '@pixi/constants';
import { TYPES } from '@pixi/constants';
import { WRAP_MODES } from '@pixi/constants';

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * This is the default batch renderer. It buffers objects
 * with texture-based geometries and renders them in
 * batches. It uploads multiple textures to the GPU to
 * reduce to the number of draw calls.
 *
 * @class
 * @protected
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export declare class AbstractBatchRenderer extends ObjectRenderer {
    readonly state: State;
    size: number;
    MAX_TEXTURES: number;
    protected shaderGenerator: BatchShaderGenerator;
    protected geometryClass: typeof BatchGeometry;
    protected vertexSize: number;
    protected _vertexCount: number;
    protected _indexCount: number;
    protected _bufferedElements: Array<IBatchableElement>;
    protected _bufferedTextures: Array<BaseTexture>;
    protected _bufferSize: number;
    protected _shader: Shader;
    protected _flushId: number;
    protected _aBuffers: Array<ViewableBuffer>;
    protected _iBuffers: Array<Uint16Array>;
    protected _dcIndex: number;
    protected _aIndex: number;
    protected _iIndex: number;
    protected _attributeBuffer: ViewableBuffer;
    protected _indexBuffer: Uint16Array;
    protected _tempBoundTextures: BaseTexture[];
    private _packedGeometries;
    private _packedGeometryPoolSize;
    /**
     * This will hook onto the renderer's `contextChange`
     * and `prerender` signals.
     *
     * @param {PIXI.Renderer} renderer - The renderer this works for.
     */
    constructor(renderer: Renderer);
    /**
     * Handles the `contextChange` signal.
     *
     * It calculates `this.MAX_TEXTURES` and allocating the
     * packed-geometry object pool.
     */
    contextChange(): void;
    /**
     * Makes sure that static and dynamic flush pooled objects have correct dimensions
     */
    initFlushBuffers(): void;
    /**
     * Handles the `prerender` signal.
     *
     * It ensures that flushes start from the first geometry
     * object again.
     */
    onPrerender(): void;
    /**
     * Buffers the "batchable" object. It need not be rendered
     * immediately.
     *
     * @param {PIXI.DisplayObject} element - the element to render when
     *    using this renderer
     */
    render(element: IBatchableElement): void;
    buildTexturesAndDrawCalls(): void;
    /**
     * Populating drawcalls for rendering
     *
     * @param {PIXI.BatchTextureArray} texArray
     * @param {number} start
     * @param {number} finish
     */
    buildDrawCalls(texArray: BatchTextureArray, start: number, finish: number): void;
    /**
     * Bind textures for current rendering
     *
     * @param {PIXI.BatchTextureArray} texArray
     */
    bindAndClearTexArray(texArray: BatchTextureArray): void;
    updateGeometry(): void;
    drawBatches(): void;
    /**
     * Renders the content _now_ and empties the current batch.
     */
    flush(): void;
    /**
     * Starts a new sprite batch.
     */
    start(): void;
    /**
     * Stops and flushes the current batch.
     */
    stop(): void;
    /**
     * Destroys this `AbstractBatchRenderer`. It cannot be used again.
     */
    destroy(): void;
    /**
     * Fetches an attribute buffer from `this._aBuffers` that
     * can hold atleast `size` floats.
     *
     * @param {number} size - minimum capacity required
     * @return {ViewableBuffer} - buffer than can hold atleast `size` floats
     * @private
     */
    getAttributeBuffer(size: number): ViewableBuffer;
    /**
     * Fetches an index buffer from `this._iBuffers` that can
     * have at least `size` capacity.
     *
     * @param {number} size - minimum required capacity
     * @return {Uint16Array} - buffer that can fit `size`
     *    indices.
     * @private
     */
    getIndexBuffer(size: number): Uint16Array;
    /**
     * Takes the four batching parameters of `element`, interleaves
     * and pushes them into the batching attribute/index buffers given.
     *
     * It uses these properties: `vertexData` `uvs`, `textureId` and
     * `indicies`. It also uses the "tint" of the base-texture, if
     * present.
     *
     * @param {PIXI.Sprite} element - element being rendered
     * @param {PIXI.ViewableBuffer} attributeBuffer - attribute buffer.
     * @param {Uint16Array} indexBuffer - index buffer
     * @param {number} aIndex - number of floats already in the attribute buffer
     * @param {number} iIndex - number of indices already in `indexBuffer`
     */
    packInterleavedGeometry(element: IBatchableElement, attributeBuffer: ViewableBuffer, indexBuffer: Uint16Array, aIndex: number, iIndex: number): void;
    /**
     * Pool of `BatchDrawCall` objects that `flush` used
     * to create "batches" of the objects being rendered.
     *
     * These are never re-allocated again.
     * Shared between all batch renderers because it can be only one "flush" working at the moment.
     *
     * @static
     * @member {PIXI.BatchDrawCall[]}
     */
    static _drawCallPool: Array<BatchDrawCall>;
    /**
     * Pool of `BatchDrawCall` objects that `flush` used
     * to create "batches" of the objects being rendered.
     *
     * These are never re-allocated again.
     * Shared between all batch renderers because it can be only one "flush" working at the moment.
     *
     * @static
     * @member {PIXI.BatchTextureArray[]}
     */
    static _textureArrayPool: Array<BatchTextureArray>;
}

/**
 * System plugin to the renderer to manage masks of certain type
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class AbstractMaskSystem extends System {
    protected maskStack: Array<MaskData>;
    protected glConst: number;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * gets count of masks of certain type
     * @returns {number}
     */
    getStackLength(): number;
    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.MaskData[]} maskStack - The mask stack
     */
    setMaskStack(maskStack: Array<MaskData>): void;
    /**
     * Setup renderer to use the current mask data.
     * @private
     */
    protected _useCurrent(): void;
    /**
     * Destroys the mask stack.
     *
     */
    destroy(): void;
}

/**
 * Resource that can manage several resource (items) inside.
 * All resources need to have the same pixel size.
 * Parent class for CubeResource and ArrayResource
 *
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 * @param {object} [options] Options to for Resource constructor
 * @param {number} [options.width] - Width of the resource
 * @param {number} [options.height] - Height of the resource
 */
declare abstract class AbstractMultiResource extends Resource {
    readonly length: number;
    items: Array<BaseTexture>;
    itemDirtyIds: Array<number>;
    private _load;
    baseTexture: BaseTexture;
    constructor(length: number, options?: ISize);
    /**
     * used from ArrayResource and CubeResource constructors
     * @param {Array<*>} resources - Can be resources, image elements, canvas, etc. ,
     *  length should be same as constructor length
     * @param {object} [options] - detect options for resources
     * @protected
     */
    protected initFromArray(resources: Array<any>, options?: IAutoDetectOptions): void;
    /**
     * Destroy this BaseImageResource
     * @override
     */
    dispose(): void;
    /**
     * Set a baseTexture by ID
     *
     * @param {PIXI.BaseTexture} baseTexture
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.AbstractMultiResource} Instance for chaining
     */
    abstract addBaseTextureAt(baseTexture: BaseTexture, index: number): this;
    /**
     * Set a resource by ID
     *
     * @param {PIXI.resources.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.ArrayResource} Instance for chaining
     */
    addResourceAt(resource: Resource, index: number): this;
    /**
     * Set the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    bind(baseTexture: BaseTexture): void;
    /**
     * Unset the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    unbind(baseTexture: BaseTexture): void;
    /**
     * Load all the resources simultaneously
     * @override
     * @return {Promise<void>} When load is resolved
     */
    load(): Promise<this>;
}

/**
 * The AbstractRenderer is the base for a PixiJS Renderer. It is extended by the {@link PIXI.CanvasRenderer}
 * and {@link PIXI.Renderer} which can be used for rendering a PixiJS scene.
 *
 * @abstract
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export declare abstract class AbstractRenderer extends EventEmitter {
    resolution: number;
    clearBeforeRender?: boolean;
    readonly options: IRendererOptions;
    readonly type: RENDERER_TYPE;
    readonly screen: Rectangle;
    readonly view: HTMLCanvasElement;
    readonly plugins: IRendererPlugins;
    readonly transparent: boolean | 'notMultiplied';
    readonly autoDensity: boolean;
    readonly preserveDrawingBuffer: boolean;
    protected _backgroundColor: number;
    protected _backgroundColorString: string;
    _backgroundColorRgba: number[];
    _lastObjectRendered: DisplayObject;
    /**
     * @param system - The name of the system this renderer is for.
     * @param [options] - The optional renderer parameters.
     * @param {number} [options.width=800] - The width of the screen.
     * @param {number} [options.height=600] - The height of the screen.
     * @param {HTMLCanvasElement} [options.view] - The canvas to use as a view, optional.
     * @param {boolean} [options.transparent=false] - If the render view is transparent.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1.
     * @param {boolean} [options.antialias=false] - Sets antialias
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer. The
     *  resolution of the renderer retina would be 2.
     * @param {boolean} [options.preserveDrawingBuffer=false] - Enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the WebGL context.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
     *      not before the new render pass.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     */
    constructor(type?: RENDERER_TYPE, options?: IRendererOptions);
    /**
     * Initialize the plugins.
     *
     * @protected
     * @param {object} staticMap - The dictionary of statically saved plugins.
     */
    initPlugins(staticMap: IRendererPlugins): void;
    /**
     * Same as view.width, actual number of pixels in the canvas by horizontal.
     *
     * @member {number}
     * @readonly
     * @default 800
     */
    get width(): number;
    /**
     * Same as view.height, actual number of pixels in the canvas by vertical.
     *
     * @member {number}
     * @readonly
     * @default 600
     */
    get height(): number;
    /**
     * Resizes the screen and canvas to the specified width and height.
     * Canvas dimensions are multiplied by resolution.
     *
     * @param screenWidth - The new width of the screen.
     * @param screenHeight - The new height of the screen.
     */
    resize(screenWidth: number, screenHeight: number): void;
    /**
     * Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     *
     * @param displayObject - The displayObject the object will be generated from.
     * @param scaleMode - The scale mode of the texture.
     * @param resolution - The resolution / device pixel ratio of the texture being generated.
     * @param [region] - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @return A texture of the graphics object.
     */
    generateTexture(displayObject: DisplayObject, scaleMode?: SCALE_MODES, resolution?: number, region?: Rectangle): RenderTexture;
    abstract render(displayObject: DisplayObject, renderTexture?: RenderTexture, clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean): void;
    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView?: boolean): void;
    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     */
    get backgroundColor(): number;
    set backgroundColor(value: number);
}

/**
 * A resource that contains a number of sources.
 *
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 * @param {number|Array<*>} source - Number of items in array or the collection
 *        of image URLs to use. Can also be resources, image elements, canvas, etc.
 * @param {object} [options] - Options to apply to {@link PIXI.resources.autoDetectResource}
 * @param {number} [options.width] - Width of the resource
 * @param {number} [options.height] - Height of the resource
 */
declare class ArrayResource extends AbstractMultiResource {
    constructor(source: number | Array<any>, options?: ISize);
    /**
     * Set a baseTexture by ID,
     * ArrayResource just takes resource from it, nothing more
     *
     * @param {PIXI.BaseTexture} baseTexture
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.ArrayResource} Instance for chaining
     */
    addBaseTextureAt(baseTexture: BaseTexture, index: number): this;
    /**
     * Add binding
     * @member {PIXI.BaseTexture}
     * @override
     */
    bind(baseTexture: BaseTexture): void;
    /**
     * Upload the resources to the GPU.
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BaseTexture} texture
     * @param {PIXI.GLTexture} glTexture
     * @returns {boolean} whether texture was uploaded
     */
    upload(renderer: Renderer, texture: BaseTexture, glTexture: GLTexture): boolean;
}

/**
 * Holds the information for a single attribute structure required to render geometry.
 *
 * This does not contain the actual data, but instead has a buffer id that maps to a {@link PIXI.Buffer}
 * This can include anything from positions, uvs, normals, colors etc.
 *
 * @class
 * @memberof PIXI
 */
export declare class Attribute {
    buffer: number;
    size: number;
    normalized: boolean;
    type: TYPES;
    stride: number;
    start: number;
    instance: boolean;
    /**
     * @param {string} buffer - the id of the buffer that this attribute will look for
     * @param {Number} [size=0] - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2.
     * @param {Boolean} [normalized=false] - should the data be normalized.
     * @param {Number} [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param {Number} [stride=0] - How far apart (in floats) the start of each value is. (used for interleaving data)
     * @param {Number} [start=0] - How far into the array to start reading values (used for interleaving data)
     */
    constructor(buffer: number, size?: number, normalized?: boolean, type?: number, stride?: number, start?: number, instance?: boolean);
    /**
     * Destroys the Attribute.
     */
    destroy(): void;
    /**
     * Helper function that creates an Attribute based on the information provided
     *
     * @static
     * @param {string} buffer - the id of the buffer that this attribute will look for
     * @param {Number} [size=0] - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
     * @param {Boolean} [normalized=false] - should the data be normalized.
     * @param {Number} [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param {Number} [stride=0] - How far apart (in floats) the start of each value is. (used for interleaving data)
     *
     * @returns {PIXI.Attribute} A new {@link PIXI.Attribute} based on the information provided
     */
    static from(buffer: number, size?: number, normalized?: boolean, type?: TYPES, stride?: number): Attribute;
}

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If WebGL is not supported by
 * the browser then this function will return a canvas renderer
 *
 * @memberof PIXI
 * @function autoDetectRenderer
 * @param {object} [options] - The optional renderer parameters
 * @param {number} [options.width=800] - the width of the renderers view
 * @param {number} [options.height=600] - the height of the renderers view
 * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
 * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
 * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
 *   resolutions other than 1
 * @param {boolean} [options.antialias=false] - sets antialias
 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
 *  need to call toDataUrl on the webgl context
 * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
 *  (shown if not transparent).
 * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
 *   not before the new render pass.
 * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
 * @param {boolean} [options.forceCanvas=false] - prevents selection of WebGL renderer, even if such is present, this
 *   option only is available when using **pixi.js-legacy** or **@pixi/canvas-renderer** modules, otherwise
 *   it is ignored.
 * @param {string} [options.powerPreference] - Parameter passed to webgl context, set to "high-performance"
 *  for devices with dual graphics card **webgl only**
 * @return {PIXI.Renderer|PIXI.CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
 */
export declare function autoDetectRenderer(options: IRendererOptionsAuto): AbstractRenderer;

/**
 * Create a resource element from a single source element. This
 * auto-detects which type of resource to create. All resources that
 * are auto-detectable must have a static `test` method and a constructor
 * with the arguments `(source, options?)`. Currently, the supported
 * resources for auto-detection include:
 *  - {@link PIXI.resources.ImageResource}
 *  - {@link PIXI.resources.CanvasResource}
 *  - {@link PIXI.resources.VideoResource}
 *  - {@link PIXI.resources.SVGResource}
 *  - {@link PIXI.resources.BufferResource}
 * @static
 * @memberof PIXI.resources
 * @function autoDetectResource
 * @param {string|*} source - Resource source, this can be the URL to the resource,
 *        a typed-array (for BufferResource), HTMLVideoElement, SVG data-uri
 *        or any other resource that can be auto-detected. If not resource is
 *        detected, it's assumed to be an ImageResource.
 * @param {object} [options] - Pass-through options to use for Resource
 * @param {number} [options.width] - Width of BufferResource or SVG rasterization
 * @param {number} [options.height] - Height of BufferResource or SVG rasterization
 * @param {boolean} [options.autoLoad=true] - Image, SVG and Video flag to start loading
 * @param {number} [options.scale=1] - SVG source scale. Overridden by width, height
 * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - Image option to create Bitmap object
 * @param {boolean} [options.crossorigin=true] - Image and Video option to set crossOrigin
 * @param {boolean} [options.autoPlay=true] - Video option to start playing video immediately
 * @param {number} [options.updateFPS=0] - Video option to update how many times a second the
 *        texture should be updated from the video. Leave at 0 to update at every render
 * @return {PIXI.resources.Resource} The created resource.
 */
declare function autoDetectResource(source: unknown, options?: IAutoDetectOptions): Resource;

/**
 * Base for all the image/canvas resources
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
declare class BaseImageResource extends Resource {
    source: ImageSource;
    noSubImage: boolean;
    /**
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement} source
     */
    constructor(source: ImageSource);
    /**
     * Set cross origin based detecting the url and the crossorigin
     * @protected
     * @param {HTMLElement} element - Element to apply crossOrigin
     * @param {string} url - URL to check
     * @param {boolean|string} [crossorigin=true] - Cross origin value to use
     */
    static crossOrigin(element: HTMLImageElement | HTMLVideoElement, url: string, crossorigin: boolean | string): void;
    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer - Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture - Reference to parent texture
     * @param {PIXI.GLTexture} glTexture
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement} [source] - (optional)
     * @returns {boolean} true is success
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture, source?: ImageSource): boolean;
    /**
     * Checks if source width/height was changed, resize can cause extra baseTexture update.
     * Triggers one update in any case.
     */
    update(): void;
    /**
     * Destroy this BaseImageResource
     * @override
     */
    dispose(): void;
}

export declare interface BaseRenderTexture extends GlobalMixins.BaseRenderTexture, BaseTexture {
}

/**
 * A BaseRenderTexture is a special texture that allows any PixiJS display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * let renderer = PIXI.autoDetectRenderer();
 * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 800, height: 600 });
 * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 * let sprite = PIXI.Sprite.from("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderer.render(sprite, renderTexture);
 * ```
 *
 * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
 * you can clear the transform
 *
 * ```js
 *
 * sprite.setTransform()
 *
 * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 100, height: 100 });
 * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 *
 * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 */
export declare class BaseRenderTexture extends BaseTexture {
    clearColor: number[];
    framebuffer: Framebuffer;
    maskStack: Array<MaskData>;
    filterStack: Array<any>;
    /**
     * @param {object} [options]
     * @param {number} [options.width=100] - The width of the base render texture.
     * @param {number} [options.height=100] - The height of the base render texture.
     * @param {PIXI.SCALE_MODES} [options.scaleMode] - See {@link PIXI.SCALE_MODES} for possible values.
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the texture being generated.
     */
    constructor(options: IBaseTextureOptions);
    /**
     * Resizes the BaseRenderTexture.
     *
     * @param {number} width - The width to resize to.
     * @param {number} height - The height to resize to.
     */
    resize(width: number, height: number): void;
    /**
     * Frees the texture and framebuffer from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose(): void;
    /**
     * Destroys this texture.
     */
    destroy(): void;
}

export declare interface BaseTexture extends GlobalMixins.BaseTexture, EventEmitter {
}

/**
 * A Texture stores the information that represents an image.
 * All textures have a base texture, which contains information about the source.
 * Therefore you can have many textures all using a single BaseTexture
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 * @param {PIXI.resources.Resource|string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [resource=null] -
 *        The current resource to use, for things that aren't Resource objects, will be converted
 *        into a Resource.
 * @param {Object} [options] - Collection of options
 * @param {PIXI.MIPMAP_MODES} [options.mipmap=PIXI.settings.MIPMAP_TEXTURES] - If mipmapping is enabled for texture
 * @param {number} [options.anisotropicLevel=PIXI.settings.ANISOTROPIC_LEVEL] - Anisotropic filtering level of texture
 * @param {PIXI.WRAP_MODES} [options.wrapMode=PIXI.settings.WRAP_MODE] - Wrap mode for textures
 * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.settings.SCALE_MODE] - Default scale mode, linear, nearest
 * @param {PIXI.FORMATS} [options.format=PIXI.FORMATS.RGBA] - GL format type
 * @param {PIXI.TYPES} [options.type=PIXI.TYPES.UNSIGNED_BYTE] - GL data type
 * @param {PIXI.TARGETS} [options.target=PIXI.TARGETS.TEXTURE_2D] - GL texture target
 * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Pre multiply the image alpha
 * @param {number} [options.width=0] - Width of the texture
 * @param {number} [options.height=0] - Height of the texture
 * @param {number} [options.resolution] - Resolution of the base texture
 * @param {object} [options.resourceOptions] - Optional resource options,
 *        see {@link PIXI.resources.autoDetectResource autoDetectResource}
 */
export declare class BaseTexture extends EventEmitter {
    width: number;
    height: number;
    resolution: number;
    alphaMode?: ALPHA_MODES;
    mipmap?: MIPMAP_MODES;
    anisotropicLevel?: number;
    scaleMode?: SCALE_MODES;
    wrapMode?: WRAP_MODES;
    format?: FORMATS;
    type?: TYPES;
    target?: TARGETS;
    readonly uid: number;
    touched: number;
    isPowerOfTwo: boolean;
    _glTextures: {
        [key: number]: GLTexture;
    };
    dirtyId: number;
    dirtyStyleId: number;
    cacheId: string;
    valid: boolean;
    textureCacheIds: Array<string>;
    destroyed: boolean;
    resource: Resource;
    _batchEnabled: number;
    _batchLocation: number;
    parentTextureArray: BaseTexture;
    constructor(resource?: Resource | ImageSource | string | any, options?: IBaseTextureOptions);
    /**
     * Pixel width of the source of this texture
     *
     * @readonly
     * @member {number}
     */
    get realWidth(): number;
    /**
     * Pixel height of the source of this texture
     *
     * @readonly
     * @member {number}
     */
    get realHeight(): number;
    /**
     * Changes style options of BaseTexture
     *
     * @param {PIXI.SCALE_MODES} [scaleMode] - Pixi scalemode
     * @param {PIXI.MIPMAP_MODES} [mipmap] - enable mipmaps
     * @returns {PIXI.BaseTexture} this
     */
    setStyle(scaleMode?: SCALE_MODES, mipmap?: MIPMAP_MODES): this;
    /**
     * Changes w/h/resolution. Texture becomes valid if width and height are greater than zero.
     *
     * @param {number} width - Visual width
     * @param {number} height - Visual height
     * @param {number} [resolution] - Optionally set resolution
     * @returns {PIXI.BaseTexture} this
     */
    setSize(width: number, height: number, resolution?: number): this;
    /**
     * Sets real size of baseTexture, preserves current resolution.
     *
     * @param {number} realWidth - Full rendered width
     * @param {number} realHeight - Full rendered height
     * @param {number} [resolution] - Optionally set resolution
     * @returns {PIXI.BaseTexture} this
     */
    setRealSize(realWidth: number, realHeight: number, resolution?: number): this;
    /**
     * Refresh check for isPowerOfTwo texture based on size
     *
     * @private
     */
    protected _refreshPOT(): void;
    /**
     * Changes resolution
     *
     * @param {number} resolution - res
     * @returns {PIXI.BaseTexture} this
     */
    setResolution(resolution: number): this;
    /**
     * Sets the resource if it wasn't set. Throws error if resource already present
     *
     * @param {PIXI.resources.Resource} resource - that is managing this BaseTexture
     * @returns {PIXI.BaseTexture} this
     */
    setResource(resource: Resource): this;
    /**
     * Invalidates the object. Texture becomes valid if width and height are greater than zero.
     */
    update(): void;
    /**
     * Handle errors with resources.
     * @private
     * @param {ErrorEvent} event - Error event emitted.
     */
    onError(event: ErrorEvent): void;
    /**
     * Destroys this base texture.
     * The method stops if resource doesn't want this texture to be destroyed.
     * Removes texture from all caches.
     */
    destroy(): void;
    /**
     * Frees the texture from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose(): void;
    /**
     * Utility function for BaseTexture|Texture cast
     */
    castToBaseTexture(): BaseTexture;
    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element. If the
     * source is an image url or an image element and not in the base texture
     * cache, it will be created and loaded.
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement|SVGElement|HTMLVideoElement} source - The
     *        source to create base texture from.
     * @param {object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
     * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
     * @returns {PIXI.BaseTexture} The new base texture.
     */
    static from(source: ImageSource | string, options: IBaseTextureOptions, strict?: boolean): BaseTexture;
    /**
     * Create a new BaseTexture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @static
     * @param {Float32Array|Uint8Array} buffer - The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param {number} width - Width of the resource
     * @param {number} height - Height of the resource
     * @param {object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.BaseTexture} The resulting new BaseTexture
     */
    static fromBuffer(buffer: Float32Array | Uint8Array, width: number, height: number, options: IBaseTextureOptions): BaseTexture;
    /**
     * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
     * @param {string} id - The id that the BaseTexture will be stored against.
     */
    static addToCache(baseTexture: BaseTexture, id: string): void;
    /**
     * Remove a BaseTexture from the global BaseTextureCache.
     *
     * @static
     * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
     * @return {PIXI.BaseTexture|null} The BaseTexture that was removed.
     */
    static removeFromCache(baseTexture: string | BaseTexture): BaseTexture | null;
    /**
     * Global number of the texture batch, used by multi-texture renderers
     *
     * @static
     * @member {number}
     */
    static _globalBatch: number;
}

/**
 * Used by the batcher to draw batches.
 * Each one of these contains all information required to draw a bound geometry.
 *
 * @class
 * @memberof PIXI
 */
export declare class BatchDrawCall {
    texArray: BatchTextureArray;
    type: DRAW_MODES;
    blend: BLEND_MODES;
    start: number;
    size: number;
    data: any;
    constructor();
}

/**
 * Geometry used to batch standard PIXI content (e.g. Mesh, Sprite, Graphics objects).
 *
 * @class
 * @memberof PIXI
 */
export declare class BatchGeometry extends Geometry {
    _buffer: Buffer_2;
    _indexBuffer: Buffer_2;
    /**
     * @param {boolean} [_static=false] - Optimization flag, where `false`
     *        is updated every frame, `true` doesn't change frame-to-frame.
     */
    constructor(_static?: boolean);
}

/**
 * @class
 * @memberof PIXI
 * @hideconstructor
 */
export declare class BatchPluginFactory {
    /**
     * Create a new BatchRenderer plugin for Renderer. this convenience can provide an easy way
     * to extend BatchRenderer with all the necessary pieces.
     * @example
     * const fragment = `
     * varying vec2 vTextureCoord;
     * varying vec4 vColor;
     * varying float vTextureId;
     * uniform sampler2D uSamplers[%count%];
     *
     * void main(void){
     *     vec4 color;
     *     %forloop%
     *     gl_FragColor = vColor * vec4(color.a - color.rgb, color.a);
     * }
     * `;
     * const InvertBatchRenderer = PIXI.BatchPluginFactory.create({ fragment });
     * PIXI.Renderer.registerPlugin('invert', InvertBatchRenderer);
     * const sprite = new PIXI.Sprite();
     * sprite.pluginName = 'invert';
     *
     * @static
     * @param {object} [options]
     * @param {string} [options.vertex=PIXI.BatchPluginFactory.defaultVertexSrc] - Vertex shader source
     * @param {string} [options.fragment=PIXI.BatchPluginFactory.defaultFragmentTemplate] - Fragment shader template
     * @param {number} [options.vertexSize=6] - Vertex size
     * @param {object} [options.geometryClass=PIXI.BatchGeometry]
     * @return {*} New batch renderer plugin
     */
    static create(options?: IBatchFactoryOptions): typeof AbstractBatchRenderer;
    /**
     * The default vertex shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultVertexSrc(): string;
    /**
     * The default fragment shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultFragmentTemplate(): string;
}

export declare const BatchRenderer: typeof AbstractBatchRenderer;

/**
 * Helper that generates batching multi-texture shader. Use it with your new BatchRenderer
 *
 * @class
 * @memberof PIXI
 */
export declare class BatchShaderGenerator {
    vertexSrc: string;
    fragTemplate: string;
    programCache: {
        [key: number]: Program;
    };
    defaultGroupCache: {
        [key: number]: UniformGroup;
    };
    /**
     * @param {string} vertexSrc - Vertex shader
     * @param {string} fragTemplate - Fragment shader template
     */
    constructor(vertexSrc: string, fragTemplate: string);
    generateShader(maxTextures: number): Shader;
    generateSampleSrc(maxTextures: number): string;
}

/**
 * System plugin to the renderer to manage batching.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class BatchSystem extends System {
    readonly emptyRenderer: ObjectRenderer;
    currentRenderer: ObjectRenderer;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Changes the current renderer to the one given in parameter
     *
     * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
     */
    setObjectRenderer(objectRenderer: ObjectRenderer): void;
    /**
     * This should be called if you wish to do some custom rendering
     * It will basically render anything that may be batched up such as sprites
     */
    flush(): void;
    /**
     * Reset the system to an empty renderer
     */
    reset(): void;
    /**
     * Handy function for batch renderers: copies bound textures in first maxTextures locations to array
     * sets actual _batchLocation for them
     *
     * @param {PIXI.BaseTexture[]} arr - arr copy destination
     * @param {number} maxTextures - number of copied elements
     */
    copyBoundTextures(arr: BaseTexture[], maxTextures: number): void;
    /**
     * Assigns batch locations to textures in array based on boundTextures state.
     * All textures in texArray should have `_batchEnabled = _batchId`,
     * and their count should be less than `maxTextures`.
     *
     * @param {PIXI.BatchTextureArray} texArray - textures to bound
     * @param {PIXI.BaseTexture[]} boundTextures - current state of bound textures
     * @param {number} batchId - marker for _batchEnabled param of textures in texArray
     * @param {number} maxTextures - number of texture locations to manipulate
     */
    boundArray(texArray: BatchTextureArray, boundTextures: Array<BaseTexture>, batchId: number, maxTextures: number): void;
}

/**
 * Used by the batcher to build texture batches.
 * Holds list of textures and their respective locations.
 *
 * @class
 * @memberof PIXI
 */
export declare class BatchTextureArray {
    elements: BaseTexture_2[];
    ids: number[];
    count: number;
    constructor();
    clear(): void;
}

/**
 * A wrapper for data so that it can be used and uploaded by WebGL
 *
 * @class
 * @memberof PIXI
 */
declare class Buffer_2 {
    data: ITypedArray;
    index: boolean;
    static: boolean;
    id: number;
    disposeRunner: Runner;
    _glBuffers: {
        [key: number]: GLBuffer;
    };
    _updateID: number;
    /**
     * @param {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data - the data to store in the buffer.
     * @param {boolean} [_static=true] - `true` for static buffer
     * @param {boolean} [index=false] - `true` for index buffer
     */
    constructor(data?: IArrayBuffer, _static?: boolean, index?: boolean);
    /**
     * flags this buffer as requiring an upload to the GPU
     * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView} [data] - the data to update in the buffer.
     */
    update(data?: IArrayBuffer): void;
    /**
     * disposes WebGL resources that are connected to this geometry
     */
    dispose(): void;
    /**
     * Destroys the buffer
     */
    destroy(): void;
    /**
     * Helper function that creates a buffer based on an array or TypedArray
     *
     * @static
     * @param {ArrayBufferView | number[]} data - the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
     * @return {PIXI.Buffer} A new Buffer based on the data provided.
     */
    static from(data: IArrayBuffer | number[]): Buffer_2;
}
export { Buffer_2 as Buffer }

/**
 * @interface SharedArrayBuffer
 */
/**
 * Buffer resource with data of typed array.
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
declare class BufferResource extends Resource {
    data: Float32Array | Uint8Array | Uint32Array;
    /**
     * @param {Float32Array|Uint8Array|Uint32Array} source - Source buffer
     * @param {object} options - Options
     * @param {number} options.width - Width of the texture
     * @param {number} options.height - Height of the texture
     */
    constructor(source: Float32Array | Uint8Array | Uint32Array, options: ISize);
    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer - Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture - Reference to parent texture
     * @param {PIXI.GLTexture} glTexture - glTexture
     * @returns {boolean} true is success
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;
    /**
     * Destroy and don't use after this
     * @override
     */
    dispose(): void;
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @return {boolean} `true` if <canvas>
     */
    static test(source: unknown): source is Float32Array | Uint8Array | Uint32Array;
}

/**
 * @interface OffscreenCanvas
 */
/**
 * Resource type for HTMLCanvasElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {HTMLCanvasElement} source - Canvas element to use
 */
declare class CanvasResource extends BaseImageResource {
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {HTMLCanvasElement|OffscreenCanvas} source - The source object
     * @return {boolean} `true` if source is HTMLCanvasElement or OffscreenCanvas
     */
    static test(source: unknown): source is OffscreenCanvas | HTMLCanvasElement;
}

export declare function checkMaxIfStatementsInShader(maxIfs: number, gl: IRenderingContext): number;

/**
 * System plugin to the renderer to manage the context.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class ContextSystem extends System {
    webGLVersion: number;
    readonly supports: ISupportDict;
    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;
    extensions: {
        drawBuffers?: WEBGL_draw_buffers;
        depthTexture?: OES_texture_float;
        loseContext?: WEBGL_lose_context;
        vertexArrayObject?: OES_vertex_array_object;
        anisotropicFiltering?: EXT_texture_filter_anisotropic;
        uint32ElementIndex?: OES_element_index_uint;
        floatTexture?: OES_texture_float;
        floatTextureLinear?: OES_texture_float_linear;
        textureHalfFloat?: OES_texture_half_float;
        textureHalfFloatLinear?: OES_texture_half_float_linear;
        colorBufferFloat?: WEBGL_color_buffer_float;
    };
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * `true` if the context is lost
     * @member {boolean}
     * @readonly
     */
    get isLost(): boolean;
    /**
     * Handle the context change event
     * @param {WebGLRenderingContext} gl - new webgl context
     */
    protected contextChange(gl: IRenderingContext): void;
    /**
     * Initialize the context
     *
     * @protected
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    initFromContext(gl: IRenderingContext): void;
    /**
     * Initialize from context options
     *
     * @protected
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
     * @param {object} options - context attributes
     */
    initFromOptions(options: WebGLContextAttributes): void;
    /**
     * Helper class to create a WebGL Context
     *
     * @param {HTMLCanvasElement} canvas - the canvas element that we will get the context from
     * @param {object} options - An options object that gets passed in to the canvas element containing the
     *    context attributes
     * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
     * @return {WebGLRenderingContext} the WebGL context
     */
    createContext(canvas: HTMLCanvasElement, options: WebGLContextAttributes): IRenderingContext;
    /**
     * Auto-populate the extensions
     *
     * @protected
     */
    protected getExtensions(): void;
    /**
     * Handles a lost webgl context
     *
     * @protected
     * @param {WebGLContextEvent} event - The context lost event.
     */
    protected handleContextLost(event: WebGLContextEvent): void;
    /**
     * Handles a restored webgl context
     *
     * @protected
     */
    protected handleContextRestored(): void;
    destroy(): void;
    /**
     * Handle the post-render runner event
     *
     * @protected
     */
    protected postrender(): void;
    /**
     * Validate context
     *
     * @protected
     * @param {WebGLRenderingContext} gl - Render context
     */
    protected validateContext(gl: IRenderingContext): void;
}

/**
 * Resource for a CubeTexture which contains six resources.
 *
 * @class
 * @extends PIXI.resources.ArrayResource
 * @memberof PIXI.resources
 * @param {Array<string|PIXI.resources.Resource>} [source] - Collection of URLs or resources
 *        to use as the sides of the cube.
 * @param {object} [options] - ImageResource options
 * @param {number} [options.width] - Width of resource
 * @param {number} [options.height] - Height of resource
 * @param {number} [options.autoLoad=true] - Whether to auto-load resources
 * @param {number} [options.linkBaseTexture=true] - In case BaseTextures are supplied,
 *   whether to copy them or use
 */
declare class CubeResource extends AbstractMultiResource {
    items: ArrayFixed<BaseTexture, 6>;
    linkBaseTexture: boolean;
    constructor(source?: ArrayFixed<string | Resource, 6>, options?: ICubeResourceOptions);
    /**
     * Add binding
     *
     * @override
     * @param {PIXI.BaseTexture} baseTexture - parent base texture
     */
    bind(baseTexture: BaseTexture): void;
    addBaseTextureAt(baseTexture: BaseTexture, index: number, linkBaseTexture?: boolean): this;
    /**
     * Upload the resource
     *
     * @returns {boolean} true is success
     */
    upload(renderer: Renderer, _baseTexture: BaseTexture, glTexture: GLTexture): boolean;
    /**
     * Number of texture sides to store for CubeResources
     *
     * @name PIXI.resources.CubeResource.SIDES
     * @static
     * @member {number}
     * @default 6
     */
    static SIDES: number;
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {object} source - The source object
     * @return {boolean} `true` if source is an array of 6 elements
     */
    static test(source: unknown): source is ArrayFixed<string | Resource, 6>;
}

export declare const defaultFilterVertex: string;

/**
 * Default filter vertex shader
 * @memberof PIXI
 * @member {string} defaultFilterVertex
 */
export declare const defaultVertex: string;

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
export declare class Filter extends Shader {
    padding: number;
    resolution: number;
    enabled: boolean;
    autoFit: boolean;
    legacy: boolean;
    state: State;
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, uniforms?: Dict<any>);
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
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES, _currentState?: FilterState): void;
    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES;
    set blendMode(value: BLEND_MODES);
    /**
     * The default vertex shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultVertexSrc(): string;
    /**
     * The default fragment shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultFragmentSrc(): string;
    /**
     * Used for caching shader IDs
     *
     * @static
     * @type {object}
     * @protected
     */
    static SOURCE_KEY_MAP: Dict<string>;
}

/**
 * System plugin to the renderer to manage filter states.
 *
 * @class
 * @private
 */
export declare class FilterState {
    renderTexture: RenderTexture;
    target: IFilterTarget;
    legacy: boolean;
    resolution: number;
    sourceFrame: Rectangle;
    destinationFrame: Rectangle;
    filters: Array<Filter>;
    constructor();
    /**
     * clears the state
     * @private
     */
    clear(): void;
}

/**
 * System plugin to the renderer to manage the filters.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
declare class FilterSystem extends System {
    readonly defaultFilterStack: Array<FilterState>;
    statePool: Array<FilterState>;
    texturePool: RenderTexturePool;
    forceClear: boolean;
    useMaxPadding: boolean;
    protected quad: Quad;
    protected quadUv: QuadUv;
    protected activeState: FilterState;
    protected globalUniforms: UniformGroup;
    private tempRect;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Adds a new filter to the System.
     *
     * @param {PIXI.DisplayObject} target - The target of the filter to render.
     * @param {PIXI.Filter[]} filters - The filters to apply.
     */
    push(target: IFilterTarget, filters: Array<Filter>): void;
    /**
     * Pops off the filter and applies it.
     *
     */
    pop(): void;
    /**
     * Binds a renderTexture with corresponding `filterFrame`, clears it if mode corresponds.
     * @param {PIXI.RenderTexture} filterTexture - renderTexture to bind, should belong to filter pool or filter stack
     * @param {PIXI.CLEAR_MODES} [clearMode] - clearMode, by default its CLEAR/YES. See {@link PIXI.CLEAR_MODES}
     */
    bindAndClear(filterTexture: RenderTexture, clearMode?: CLEAR_MODES): void;
    /**
     * Draws a filter.
     *
     * @param {PIXI.Filter} filter - The filter to draw.
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {PIXI.CLEAR_MODES} [clearMode] - Should the output be cleared before rendering to it
     */
    applyFilter(filter: Filter, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
    /**
     * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
     *
     * Use `outputMatrix * vTextureCoord` in the shader.
     *
     * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
     * @param {PIXI.Sprite} sprite - The sprite to map to.
     * @return {PIXI.Matrix} The mapped matrix.
     */
    calculateSpriteMatrix(outputMatrix: Matrix, sprite: ISpriteMaskTarget): Matrix;
    /**
     * Destroys this Filter System.
     */
    destroy(): void;
    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     *
     * @protected
     * @param {number} minWidth - The minimum width of the render texture in real pixels.
     * @param {number} minHeight - The minimum height of the render texture in real pixels.
     * @param {number} [resolution=1] - The resolution of the render texture.
     * @return {PIXI.RenderTexture} The new render texture.
     */
    protected getOptimalFilterTexture(minWidth: number, minHeight: number, resolution?: number): RenderTexture;
    /**
     * Gets extra render texture to use inside current filter
     * To be compliant with older filters, you can use params in any order
     *
     * @param {PIXI.RenderTexture} [input] - renderTexture from which size and resolution will be copied
     * @param {number} [resolution] - override resolution of the renderTexture
     * @returns {PIXI.RenderTexture}
     */
    getFilterTexture(input?: RenderTexture, resolution?: number): RenderTexture;
    /**
     * Frees a render texture back into the pool.
     *
     * @param {PIXI.RenderTexture} renderTexture - The renderTarget to free
     */
    returnFilterTexture(renderTexture: RenderTexture): void;
    /**
     * Empties the texture pool.
     */
    emptyPool(): void;
    /**
     * calls `texturePool.resize()`, affects fullScreen renderTextures
     */
    resize(): void;
}

/**
 * Frame buffer used by the BaseRenderTexture
 *
 * @class
 * @memberof PIXI
 */
export declare class Framebuffer {
    width: number;
    height: number;
    multisample: MSAA_QUALITY;
    stencil: boolean;
    depth: boolean;
    dirtyId: number;
    dirtyFormat: number;
    dirtySize: number;
    depthTexture: BaseTexture;
    colorTextures: Array<BaseTexture>;
    glFramebuffers: {
        [key: string]: GLFramebuffer;
    };
    disposeRunner: Runner;
    /**
     * @param {number} width - Width of the frame buffer
     * @param {number} height - Height of the frame buffer
     */
    constructor(width: number, height: number);
    /**
     * Reference to the colorTexture.
     *
     * @member {PIXI.BaseTexture[]}
     * @readonly
     */
    get colorTexture(): BaseTexture;
    /**
     * Add texture to the colorTexture array
     *
     * @param {number} [index=0] - Index of the array to add the texture to
     * @param {PIXI.BaseTexture} [texture] - Texture to add to the array
     */
    addColorTexture(index?: number, texture?: BaseTexture): this;
    /**
     * Add a depth texture to the frame buffer
     *
     * @param {PIXI.BaseTexture} [texture] - Texture to add
     */
    addDepthTexture(texture?: BaseTexture): this;
    /**
     * Enable depth on the frame buffer
     */
    enableDepth(): this;
    /**
     * Enable stencil on the frame buffer
     */
    enableStencil(): this;
    /**
     * Resize the frame buffer
     *
     * @param {number} width - Width of the frame buffer to resize to
     * @param {number} height - Height of the frame buffer to resize to
     */
    resize(width: number, height: number): void;
    /**
     * Disposes WebGL resources that are connected to this geometry
     */
    dispose(): void;
    /**
     * Destroys and removes the depth texture added to this framebuffer.
     */
    destroyDepthTexture(): void;
}

/**
 * System plugin to the renderer to manage framebuffers.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class FramebufferSystem extends System {
    readonly managedFramebuffers: Array<Framebuffer>;
    current: Framebuffer;
    viewport: Rectangle;
    hasMRT: boolean;
    writeDepthTexture: boolean;
    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;
    protected unknownFramebuffer: Framebuffer;
    protected msaaSamples: Array<number>;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Sets up the renderer context and necessary buffers.
     */
    protected contextChange(): void;
    /**
     * Bind a framebuffer
     *
     * @param {PIXI.Framebuffer} framebuffer
     * @param {PIXI.Rectangle} [frame] - frame, default is framebuffer size
     */
    bind(framebuffer?: Framebuffer, frame?: Rectangle): void;
    /**
     * Set the WebGLRenderingContext's viewport.
     *
     * @param {Number} x - X position of viewport
     * @param {Number} y - Y position of viewport
     * @param {Number} width - Width of viewport
     * @param {Number} height - Height of viewport
     */
    setViewport(x: number, y: number, width: number, height: number): void;
    /**
     * Get the size of the current width and height. Returns object with `width` and `height` values.
     *
     * @member {object}
     * @readonly
     */
    get size(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Clear the color of the context
     *
     * @param {Number} r - Red value from 0 to 1
     * @param {Number} g - Green value from 0 to 1
     * @param {Number} b - Blue value from 0 to 1
     * @param {Number} a - Alpha value from 0 to 1
     * @param {PIXI.BUFFER_BITS} [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
     *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
     */
    clear(r: number, g: number, b: number, a: number, mask?: BUFFER_BITS): void;
    /**
     * Initialize framebuffer for this context
     *
     * @protected
     * @param {PIXI.Framebuffer} framebuffer
     * @returns {PIXI.GLFramebuffer} created GLFramebuffer
     */
    initFramebuffer(framebuffer: Framebuffer): GLFramebuffer;
    /**
     * Resize the framebuffer
     *
     * @protected
     * @param {PIXI.Framebuffer} framebuffer
     */
    resizeFramebuffer(framebuffer: Framebuffer): void;
    /**
     * Update the framebuffer
     *
     * @protected
     * @param {PIXI.Framebuffer} framebuffer
     */
    updateFramebuffer(framebuffer: Framebuffer): void;
    /**
     * Detects number of samples that is not more than a param but as close to it as possible
     *
     * @param {PIXI.MSAA_QUALITY} samples - number of samples
     * @returns {PIXI.MSAA_QUALITY} - recommended number of samples
     */
    protected detectSamples(samples: MSAA_QUALITY): MSAA_QUALITY;
    /**
     * Only works with WebGL2
     *
     * blits framebuffer to another of the same or bigger size
     * after that target framebuffer is bound
     *
     * Fails with WebGL warning if blits multisample framebuffer to different size
     *
     * @param {PIXI.Framebuffer} [framebuffer] - by default it blits "into itself", from renderBuffer to texture.
     * @param {PIXI.Rectangle} [sourcePixels] - source rectangle in pixels
     * @param {PIXI.Rectangle} [destPixels] - dest rectangle in pixels, assumed to be the same as sourcePixels
     */
    blit(framebuffer?: Framebuffer, sourcePixels?: Rectangle, destPixels?: Rectangle): void;
    /**
     * Disposes framebuffer
     * @param {PIXI.Framebuffer} framebuffer - framebuffer that has to be disposed of
     * @param {boolean} [contextLost=false] - If context was lost, we suppress all delete function calls
     */
    disposeFramebuffer(framebuffer: Framebuffer, contextLost?: boolean): void;
    /**
     * Disposes all framebuffers, but not textures bound to them
     * @param {boolean} [contextLost=false] - If context was lost, we suppress all delete function calls
     */
    disposeAll(contextLost?: boolean): void;
    /**
     * Forcing creation of stencil buffer for current framebuffer, if it wasn't done before.
     * Used by MaskSystem, when its time to use stencil mask for Graphics element.
     *
     * Its an alternative for public lazy `framebuffer.enableStencil`, in case we need stencil without rebind.
     *
     * @private
     */
    forceStencil(): void;
    /**
     * resets framebuffer stored state, binds screen framebuffer
     *
     * should be called before renderTexture reset()
     */
    reset(): void;
}

/**
 * The Geometry represents a model. It consists of two components:
 * - GeometryStyle - The structure of the model such as the attributes layout
 * - GeometryData - the data of the model - this consists of buffers.
 * This can include anything from positions, uvs, normals, colors etc.
 *
 * Geometry can be defined without passing in a style or data if required (thats how I prefer!)
 *
 * ```js
 * let geometry = new PIXI.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1],2)
 * geometry.addIndex([0,1,2,1,3,2])
 *
 * ```
 * @class
 * @memberof PIXI
 */
export declare class Geometry {
    buffers: Array<Buffer_2>;
    indexBuffer: Buffer_2;
    attributes: {
        [key: string]: Attribute;
    };
    id: number;
    instanced: boolean;
    instanceCount: number;
    glVertexArrayObjects: {
        [key: number]: {
            [key: string]: WebGLVertexArrayObject;
        };
    };
    disposeRunner: Runner;
    refCount: number;
    /**
     * @param {PIXI.Buffer[]} [buffers] - an array of buffers. optional.
     * @param {object} [attributes] - of the geometry, optional structure of the attributes layout
     */
    constructor(buffers?: Array<Buffer_2>, attributes?: {
        [key: string]: Attribute;
    });
    /**
    *
    * Adds an attribute to the geometry
    * Note: `stride` and `start` should be `undefined` if you dont know them, not 0!
    *
    * @param {String} id - the name of the attribute (matching up to a shader)
    * @param {PIXI.Buffer|number[]} [buffer] - the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
    * @param {Number} [size=0] - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
    * @param {Boolean} [normalized=false] - should the data be normalized.
    * @param {Number} [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {PIXI.TYPES} to see the ones available
    * @param {Number} [stride] - How far apart (in floats) the start of each value is. (used for interleaving data)
    * @param {Number} [start] - How far into the array to start reading values (used for interleaving data)
    * @param {boolean} [instance=false] - Instancing flag
    *
    * @return {PIXI.Geometry} returns self, useful for chaining.
    */
    addAttribute(id: string, buffer: Buffer_2 | Float32Array | Uint32Array | Array<number>, size?: number, normalized?: boolean, type?: TYPES, stride?: number, start?: number, instance?: boolean): this;
    /**
     * returns the requested attribute
     *
     * @param {String} id - the name of the attribute required
     * @return {PIXI.Attribute} the attribute requested.
     */
    getAttribute(id: string): Attribute;
    /**
     * returns the requested buffer
     *
     * @param {String} id - the name of the buffer required
     * @return {PIXI.Buffer} the buffer requested.
     */
    getBuffer(id: string): Buffer_2;
    /**
    *
    * Adds an index buffer to the geometry
    * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
    *
    * @param {PIXI.Buffer|number[]} [buffer] - the buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
    * @return {PIXI.Geometry} returns self, useful for chaining.
    */
    addIndex(buffer?: Buffer_2 | IArrayBuffer | number[]): Geometry;
    /**
     * returns the index buffer
     *
     * @return {PIXI.Buffer} the index buffer.
     */
    getIndex(): Buffer_2;
    /**
     * this function modifies the structure so that all current attributes become interleaved into a single buffer
     * This can be useful if your model remains static as it offers a little performance boost
     *
     * @return {PIXI.Geometry} returns self, useful for chaining.
     */
    interleave(): Geometry;
    getSize(): number;
    /**
     * disposes WebGL resources that are connected to this geometry
     */
    dispose(): void;
    /**
     * Destroys the geometry.
     */
    destroy(): void;
    /**
     * returns a clone of the geometry
     *
     * @returns {PIXI.Geometry} a new clone of this geometry
     */
    clone(): Geometry;
    /**
     * merges an array of geometries into a new single one
     * geometry attribute styles must match for this operation to work
     *
     * @param {PIXI.Geometry[]} geometries - array of geometries to merge
     * @returns {PIXI.Geometry} shiny new geometry!
     */
    static merge(geometries: Array<Geometry>): Geometry;
}

/**
 * System plugin to the renderer to manage geometry.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class GeometrySystem extends System {
    hasVao: boolean;
    hasInstance: boolean;
    canUseUInt32ElementIndex: boolean;
    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;
    protected _activeGeometry: Geometry;
    protected _activeVao: WebGLVertexArrayObject;
    protected _boundBuffer: GLBuffer;
    readonly managedGeometries: {
        [key: number]: Geometry;
    };
    readonly managedBuffers: {
        [key: number]: Buffer_2;
    };
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Sets up the renderer context and necessary buffers.
     */
    protected contextChange(): void;
    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     *
     * @param {PIXI.Geometry} geometry - instance of geometry to bind
     * @param {PIXI.Shader} [shader] - instance of shader to use vao for
     */
    bind(geometry?: Geometry, shader?: Shader): void;
    /**
     * Reset and unbind any active VAO and geometry
     */
    reset(): void;
    /**
     * Update buffers
     * @protected
     */
    updateBuffers(): void;
    /**
     * Check compability between a geometry and a program
     * @protected
     * @param {PIXI.Geometry} geometry - Geometry instance
     * @param {PIXI.Program} program - Program instance
     */
    protected checkCompatibility(geometry: Geometry, program: Program): void;
    /**
     * Takes a geometry and program and generates a unique signature for them.
     *
     * @param {PIXI.Geometry} geometry - to get signature from
     * @param {PIXI.Program} program - to test geometry against
     * @returns {String} Unique signature of the geometry and program
     * @protected
     */
    protected getSignature(geometry: Geometry, program: Program): string;
    /**
     * Creates or gets Vao with the same structure as the geometry and stores it on the geometry.
     * If vao is created, it is bound automatically.
     *
     * @protected
     * @param {PIXI.Geometry} geometry - Instance of geometry to to generate Vao for
     * @param {PIXI.Program} program - Instance of program
     */
    protected initGeometryVao(geometry: Geometry, program: Program): WebGLVertexArrayObject;
    /**
     * Disposes buffer
     * @param {PIXI.Buffer} buffer - buffer with data
     * @param {boolean} [contextLost=false] - If context was lost, we suppress deleteVertexArray
     */
    disposeBuffer(buffer: Buffer_2, contextLost?: boolean): void;
    /**
     * Disposes geometry
     * @param {PIXI.Geometry} geometry - Geometry with buffers. Only VAO will be disposed
     * @param {boolean} [contextLost=false] - If context was lost, we suppress deleteVertexArray
     */
    disposeGeometry(geometry: Geometry, contextLost?: boolean): void;
    /**
     * dispose all WebGL resources of all managed geometries and buffers
     * @param {boolean} [contextLost=false] - If context was lost, we suppress `gl.delete` calls
     */
    disposeAll(contextLost?: boolean): void;
    /**
     * Activate vertex array object
     *
     * @protected
     * @param {PIXI.Geometry} geometry - Geometry instance
     * @param {PIXI.Program} program - Shader program instance
     */
    protected activateVao(geometry: Geometry, program: Program): void;
    /**
     * Draw the geometry
     *
     * @param {Number} type - the type primitive to render
     * @param {Number} [size] - the number of elements to be rendered
     * @param {Number} [start] - Starting index
     * @param {Number} [instanceCount] - the number of instances of the set of elements to execute
     */
    draw(type: DRAW_MODES, size?: number, start?: number, instanceCount?: number): this;
    /**
     * Unbind/reset everything
     * @protected
     */
    protected unbind(): void;
}

declare class GLBuffer {
    buffer: WebGLBuffer;
    updateID: number;
    byteLength: number;
    refCount: number;
    constructor(buffer?: WebGLBuffer);
}

/**
 * Internal framebuffer for WebGL context
 * @class
 * @memberof PIXI
 */
export declare class GLFramebuffer {
    framebuffer: WebGLFramebuffer;
    stencil: WebGLRenderbuffer;
    multisample: MSAA_QUALITY;
    msaaBuffer: WebGLRenderbuffer;
    blitFramebuffer: Framebuffer;
    dirtyId: number;
    dirtyFormat: number;
    dirtySize: number;
    constructor(framebuffer: WebGLTexture);
}

/**
 * Helper class to create a WebGL Program
 *
 * @class
 * @memberof PIXI
 */
export declare class GLProgram {
    program: WebGLProgram;
    uniformData: Dict<any>;
    uniformGroups: Dict<any>;
    /**
     * Makes a new Pixi program
     *
     * @param {WebGLProgram} program - webgl program
     * @param {Object} uniformData - uniforms
     */
    constructor(program: WebGLProgram, uniformData: {
        [key: string]: IGLUniformData;
    });
    /**
     * Destroys this program
     */
    destroy(): void;
}

/**
 * Internal texture for WebGL context
 * @class
 * @memberof PIXI
 */
export declare class GLTexture {
    texture: WebGLTexture;
    width: number;
    height: number;
    mipmap: boolean;
    wrapMode: number;
    type: number;
    internalFormat: number;
    dirtyId: number;
    dirtyStyleId: number;
    constructor(texture: WebGLTexture);
}

/**
 * Marks places in PixiJS where you can pass Float32Array, UInt32Array, any typed arrays, and ArrayBuffer
 *
 * Same as ArrayBuffer in typescript lib, defined here just for documentation
 */
export declare interface IArrayBuffer extends ArrayBuffer {
}

export declare interface IAttributeData {
    type: string;
    size: number;
    location: number;
    name: string;
}

declare type IAutoDetectOptions = ISize | ICubeResourceOptions | IImageResourceOptions | ISVGResourceOptions | IVideoResourceOptions | IResourcePluginOptions;

export declare interface IBaseTextureOptions {
    alphaMode?: ALPHA_MODES;
    mipmap?: MIPMAP_MODES;
    anisotropicLevel?: number;
    scaleMode?: SCALE_MODES;
    width?: number;
    height?: number;
    wrapMode?: WRAP_MODES;
    format?: FORMATS;
    type?: TYPES;
    target?: TARGETS;
    resolution?: number;
    resourceOptions?: any;
    pixiIdPrefix?: string;
}

/**
 * Interface for elements like Sprite, Mesh etc. for batching.
 */
export declare interface IBatchableElement {
    _texture: Texture;
    vertexData: Float32Array;
    indices: Uint16Array | Uint32Array | Array<number>;
    uvs: Float32Array;
    worldAlpha: number;
    _tintRGB: number;
    blendMode: BLEND_MODES;
}

export declare interface IBatchFactoryOptions {
    vertex?: string;
    fragment?: string;
    geometryClass?: typeof BatchGeometry;
    vertexSize?: number;
}

/**
 * Constructor options for CubeResource
 */
declare interface ICubeResourceOptions extends ISize {
    autoLoad?: boolean;
    linkBaseTexture?: boolean;
}

export declare interface IFilterTarget {
    filterArea: Rectangle;
    getBounds(skipUpdate?: boolean): Rectangle;
}

export declare class IGLUniformData {
    location: WebGLUniformLocation;
    value: number | boolean | Float32Array | Int32Array | Uint32Array | boolean[];
}

declare interface IImageResourceOptions {
    autoLoad?: boolean;
    createBitmap?: boolean;
    crossorigin?: boolean | string;
    alphaMode?: ALPHA_MODES;
}

/**
 * Resource type for ImageBitmap.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {ImageBitmap} source - Image element to use
 */
declare class ImageBitmapResource extends BaseImageResource {
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {ImageBitmap} source - The source object
     * @return {boolean} `true` if source is an ImageBitmap
     */
    static test(source: unknown): source is ImageBitmap;
}

/**
 * Resource type for HTMLImageElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 */
declare class ImageResource extends BaseImageResource {
    url: string;
    private _load;
    private _process;
    preserveBitmap: boolean;
    createBitmap: boolean;
    alphaMode: ALPHA_MODES;
    bitmap: ImageBitmap;
    /**
     * @param {HTMLImageElement|string} source - image source or URL
     * @param {object} [options]
     * @param {boolean} [options.autoLoad=true] - start loading process
     * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - whether its required to create
     *        a bitmap before upload
     * @param {boolean} [options.crossorigin=true] - Load image using cross origin
     * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Premultiply image alpha in bitmap
     */
    constructor(source: HTMLImageElement | string, options?: IImageResourceOptions);
    /**
     * returns a promise when image will be loaded and processed
     *
     * @param {boolean} [createBitmap] - whether process image into bitmap
     * @returns {Promise<void>}
     */
    load(createBitmap?: boolean): Promise<ImageResource>;
    /**
     * Called when we need to convert image into BitmapImage.
     * Can be called multiple times, real promise is cached inside.
     *
     * @returns {Promise<void>} cached promise to fill that bitmap
     */
    process(): Promise<ImageResource>;
    /**
     * Upload the image resource to GPU.
     *
     * @param {PIXI.Renderer} renderer - Renderer to upload to
     * @param {PIXI.BaseTexture} baseTexture - BaseTexture for this resource
     * @param {PIXI.GLTexture} glTexture - GLTexture to use
     * @returns {boolean} true is success
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;
    /**
     * Destroys this texture
     * @override
     */
    dispose(): void;
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {string|HTMLImageElement} source - The source object
     * @return {boolean} `true` if source is string or HTMLImageElement
     */
    static test(source: unknown): source is string | HTMLImageElement;
}

export declare type ImageSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap;

export declare interface IMaskTarget extends IFilterTarget {
    renderable: boolean;
    isSprite?: boolean;
    worldTransform: Matrix;
    isFastRect?(): boolean;
    getBounds(skipUpdate?: boolean): Rectangle;
    render(renderer: Renderer): void;
}

export declare interface IRendererOptions extends GlobalMixins.IRendererOptions {
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    transparent?: boolean | 'notMultiplied';
    autoDensity?: boolean;
    antialias?: boolean;
    resolution?: number;
    preserveDrawingBuffer?: boolean;
    clearBeforeRender?: boolean;
    backgroundColor?: number;
    powerPreference?: WebGLPowerPreference;
    context?: IRenderingContext;
}

export declare interface IRendererOptionsAuto extends IRendererOptions {
    forceCanvas?: boolean;
}

export declare interface IRendererPlugin {
    destroy(): void;
}

export declare interface IRendererPluginConstructor {
    new (renderer: Renderer, options?: any): IRendererPlugin;
}

export declare interface IRendererPlugins {
    [key: string]: any;
}

/**
 * Mixed WebGL1/WebGL2 Rendering Context.
 * Either its WebGL2, either its WebGL1 with PixiJS polyfills on it
 */
export declare interface IRenderingContext extends WebGL2RenderingContext {
}

declare type IResourcePluginOptions = {
    [key: string]: any;
};

export declare interface ISpriteMaskTarget extends IMaskTarget {
    _texture: Texture;
    worldAlpha: number;
    anchor: Point;
}

declare interface ISupportDict {
    uint32Indices: boolean;
}

declare interface ISVGResourceOptions {
    source?: string;
    scale?: number;
    width?: number;
    height?: number;
    autoLoad?: boolean;
    crossorigin?: boolean | string;
}

/**
 * PixiJS classes use this type instead of ArrayBuffer and typed arrays
 * to support expressions like `geometry.buffers[0].data[0] = position.x`.
 *
 * Gives access to indexing and `length` field
 *
 * @popelyshev: If data is actually ArrayBuffer and throws Exception on indexing - its user problem :)
 */
export declare interface ITypedArray extends IArrayBuffer {
    readonly length: number;
    [index: number]: number;
    readonly BYTES_PER_ELEMENT: number;
}

export declare interface IUniformData {
    type: string;
    size: number;
    isArray: RegExpMatchArray;
    value: any;
}

export declare interface IUniformParser {
    test(data: unknown, uniform: any): boolean;
    code(name: string, uniform: any): string;
}

declare interface IUnloadableTexture {
    _texture: Texture | RenderTexture;
    children: IUnloadableTexture[];
}

declare interface IVideoResourceOptions {
    autoLoad?: boolean;
    autoPlay?: boolean;
    updateFPS?: number;
    crossorigin?: boolean | string;
}

declare interface IVideoResourceOptionsElement {
    src: string;
    mime: string;
}

/**
 * Component for masked elements
 *
 * Holds mask mode and temporary data about current mask
 *
 * @class
 * @memberof PIXI
 */
export declare class MaskData {
    type: MASK_TYPES;
    autoDetect: boolean;
    maskObject: IMaskTarget;
    pooled: boolean;
    isMaskData: true;
    _stencilCounter: number;
    _scissorCounter: number;
    _scissorRect: Rectangle;
    _target: IMaskTarget;
    /**
     * Create MaskData
     *
     * @param {PIXI.DisplayObject} [maskObject=null] - object that describes the mask
     */
    constructor(maskObject?: IMaskTarget);
    /**
     * resets the mask data after popMask()
     */
    reset(): void;
    /**
     * copies counters from maskData above, called from pushMask()
     * @param {PIXI.MaskData|null} maskAbove
     */
    copyCountersOrReset(maskAbove?: MaskData): void;
}

/**
 * System plugin to the renderer to manage masks.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class MaskSystem extends System {
    enableScissor: boolean;
    protected readonly alphaMaskPool: Array<SpriteMaskFilter[]>;
    protected alphaMaskIndex: number;
    private readonly maskDataPool;
    private maskStack;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.MaskData[]} maskStack - The mask stack
     */
    setMaskStack(maskStack: Array<MaskData>): void;
    /**
     * Applies the Mask and adds it to the current filter stack.
     * Renderer batch must be flushed beforehand.
     *
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.MaskData|PIXI.Sprite|PIXI.Graphics|PIXI.DisplayObject} maskData - The masking data.
     */
    push(target: IMaskTarget, maskDataOrTarget: MaskData | IMaskTarget): void;
    /**
     * Removes the last mask from the mask stack and doesn't return it.
     * Renderer batch must be flushed beforehand.
     *
     * @param {PIXI.DisplayObject} target - Display Object to pop the mask from
     */
    pop(target: IMaskTarget): void;
    /**
     * Sets type of MaskData based on its maskObject
     * @param {PIXI.MaskData} maskData
     */
    detect(maskData: MaskData): void;
    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.MaskData} maskData - Sprite to be used as the mask
     */
    pushSpriteMask(maskData: MaskData): void;
    /**
     * Removes the last filter from the filter stack and doesn't return it.
     */
    popSpriteMask(): void;
}

/**
 * Base for a common object renderer that can be used as a
 * system renderer plugin.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI
 */
export declare class ObjectRenderer {
    protected renderer: Renderer;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this manager works for.
     */
    constructor(renderer: Renderer);
    /**
     * Stub method that should be used to empty the current
     * batch by rendering objects now.
     */
    flush(): void;
    /**
     * Generic destruction method that frees all resources. This
     * should be called by subclasses.
     */
    destroy(): void;
    /**
     * Stub method that initializes any state required before
     * rendering starts. It is different from the `prerender`
     * signal, which occurs every frame, in that it is called
     * whenever an object requests _this_ renderer specifically.
     */
    start(): void;
    /**
     * Stops the renderer. It should free up any state and
     * become dormant.
     */
    stop(): void;
    /**
     * Keeps the object to render. It doesn't have to be
     * rendered immediately.
     *
     * @param {PIXI.DisplayObject} object - The object to render.
     */
    render(_object: any): void;
}

/**
 * Helper class to create a shader program.
 *
 * @class
 * @memberof PIXI
 */
export declare class Program {
    id: number;
    vertexSrc: string;
    fragmentSrc: string;
    nameCache: any;
    glPrograms: {
        [key: number]: GLProgram;
    };
    syncUniforms: any;
    attributeData: {
        [key: string]: IAttributeData;
    };
    uniformData: {
        [key: string]: IUniformData;
    };
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {string} [name] - Name for shader
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, name?: string);
    /**
     * Extracts the data for a buy creating a small test program
     * or reading the src directly.
     * @protected
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     */
    protected extractData(vertexSrc: string, fragmentSrc: string): void;
    /**
     * returns the attribute data from the program
     * @private
     *
     * @param {WebGLProgram} [program] - the WebGL program
     * @param {WebGLRenderingContext} [gl] - the WebGL context
     *
     * @returns {object} the attribute data for this program
     */
    protected getAttributeData(program: WebGLProgram, gl: WebGLRenderingContextBase): {
        [key: string]: IAttributeData;
    };
    /**
     * returns the uniform data from the program
     * @private
     *
     * @param {webGL-program} [program] - the webgl program
     * @param {context} [gl] - the WebGL context
     *
     * @returns {object} the uniform data for this program
     */
    private getUniformData;
    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     * @member {string}
     */
    static get defaultVertexSrc(): string;
    /**
     * The default fragment shader source
     *
     * @static
     * @constant
     * @member {string}
     */
    static get defaultFragmentSrc(): string;
    /**
     * A short hand function to create a program based of a vertex and fragment shader
     * this method will also check to see if there is a cached program.
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {string} [name=pixi-shader] - Name for shader
     *
     * @returns {PIXI.Program} an shiny new Pixi shader!
     */
    static from(vertexSrc?: string, fragmentSrc?: string, name?: string): Program;
}

/**
 * System plugin to the renderer to manage the projection matrix.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class ProjectionSystem extends System {
    destinationFrame: Rectangle;
    sourceFrame: Rectangle;
    defaultFrame: Rectangle;
    projectionMatrix: Matrix;
    transform: Matrix;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle).
     *
     * Make sure to run `renderer.framebuffer.setViewport(destinationFrame)` after calling this.
     *
     * @param {PIXI.Rectangle} destinationFrame - The destination frame.
     * @param {PIXI.Rectangle} sourceFrame - The source frame.
     * @param {Number} resolution - Resolution
     * @param {boolean} root - If is root
     */
    update(destinationFrame: Rectangle, sourceFrame: Rectangle, resolution: number, root: boolean): void;
    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle)
     *
     * @param {PIXI.Rectangle} destinationFrame - The destination frame.
     * @param {PIXI.Rectangle} sourceFrame - The source frame.
     * @param {Number} resolution - Resolution
     * @param {boolean} root - If is root
     */
    calculateProjection(_destinationFrame: Rectangle, sourceFrame: Rectangle, _resolution: number, root: boolean): void;
    /**
     * Sets the transform of the active render target to the given matrix
     *
     * @param {PIXI.Matrix} matrix - The transformation matrix
     */
    setTransform(_matrix: Matrix): void;
}

/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 */
export declare class Quad extends Geometry {
    constructor();
}

/**
 * Helper class to create a quad with uvs like in v4
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Geometry
 */
export declare class QuadUv extends Geometry {
    vertexBuffer: Buffer_2;
    uvBuffer: Buffer_2;
    vertices: Float32Array;
    uvs: Float32Array;
    constructor();
    /**
     * Maps two Rectangle to the quad.
     *
     * @param {PIXI.Rectangle} targetTextureFrame - the first rectangle
     * @param {PIXI.Rectangle} destinationFrame - the second rectangle
     * @return {PIXI.Quad} Returns itself.
     */
    map(targetTextureFrame: Rectangle, destinationFrame: Rectangle): this;
    /**
     * legacy upload method, just marks buffers dirty
     * @returns {PIXI.QuadUv} Returns itself.
     */
    invalidate(): this;
}

/**
 * The Renderer draws the scene and all its content onto a WebGL enabled canvas.
 *
 * This renderer should be used for browsers that support WebGL.
 *
 * This renderer works by automatically managing WebGLBatchesm, so no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything!
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.AbstractRenderer
 */
export declare class Renderer extends AbstractRenderer {
    gl: IRenderingContext;
    globalUniforms: UniformGroup;
    CONTEXT_UID: number;
    renderingToScreen: boolean;
    extract: Extract_2;
    mask: MaskSystem;
    context: ContextSystem;
    state: StateSystem;
    shader: ShaderSystem;
    texture: TextureSystem;
    geometry: GeometrySystem;
    framebuffer: FramebufferSystem;
    scissor: ScissorSystem;
    stencil: StencilSystem;
    projection: ProjectionSystem;
    textureGC: TextureGCSystem;
    filter: FilterSystem;
    renderTexture: RenderTextureSystem;
    batch: BatchSystem;
    runners: {
        [key: string]: Runner;
    };
    /**
     * Create renderer if WebGL is available. Overrideable
     * by the **@pixi/canvas-renderer** package to allow fallback.
     * throws error if WebGL is not available.
     * @static
     * @private
     */
    static create(options: IRendererOptions): AbstractRenderer;
    /**
     * @param [options] - The optional renderer parameters.
     * @param {number} [options.width=800] - The width of the screen.
     * @param {number} [options.height=600] - The height of the screen.
     * @param {HTMLCanvasElement} [options.view] - The canvas to use as a view, optional.
     * @param {boolean} [options.transparent=false] - If the render view is transparent.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1.
     * @param {boolean} [options.antialias=false] - Sets antialias. If not available natively then FXAA
     *  antialiasing is used.
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer.
     *  The resolution of the renderer retina would be 2.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear
     *  the canvas or not before the new render pass. If you wish to set this to false, you *must* set
     *  preserveDrawingBuffer to `true`.
     * @param {boolean} [options.preserveDrawingBuffer=false] - Enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the WebGL context.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     * @param {string} [options.powerPreference] - Parameter passed to WebGL context, set to "high-performance"
     *  for devices with dual graphics card.
     * @param {object} [options.context] - If WebGL context already exists, all parameters must be taken from it.
     * @public
     */
    constructor(options?: IRendererOptions);
    /**
     * Add a new system to the renderer.
     * @param ClassRef - Class reference
     * @param [name] - Property name for system, if not specified
     *        will use a static `name` property on the class itself. This
     *        name will be assigned as s property on the Renderer so make
     *        sure it doesn't collide with properties on Renderer.
     * @return {PIXI.Renderer} Return instance of renderer
     */
    addSystem<T extends System>(ClassRef: {
        new (renderer: Renderer): T;
    }, name: string): this;
    /**
     * Renders the object to its WebGL view
     *
     * @param displayObject - The object to be rendered.
     * @param [renderTexture] - The render texture to render to.
     * @param [clear=true] - Should the canvas be cleared before the new render.
     * @param [transform] - A transform to apply to the render texture before rendering.
     * @param [skipUpdateTransform=false] - Should we skip the update transform pass?
     */
    render(displayObject: DisplayObject, renderTexture?: RenderTexture, clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean): void;
    /**
     * Resizes the WebGL view to the specified width and height.
     *
     * @param screenWidth - The new width of the screen.
     * @param screenHeight - The new height of the screen.
     */
    resize(screenWidth: number, screenHeight: number): void;
    /**
     * Resets the WebGL state so you can render things however you fancy!
     *
     * @return {PIXI.Renderer} Returns itself.
     */
    reset(): this;
    /**
     * Clear the frame buffer
     */
    clear(): void;
    /**
     * Removes everything from the renderer (event listeners, spritebatch, etc...)
     *
     * @param [removeView=false] - Removes the Canvas element from the DOM.
     *  See: https://github.com/pixijs/pixi.js/issues/2233
     */
    destroy(removeView?: boolean): void;
    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @name plugins
     * @type {object}
     * @readonly
     * @property {PIXI.AccessibilityManager} accessibility Support tabbing interactive elements.
     * @property {PIXI.Extract} extract Extract image data from renderer.
     * @property {PIXI.InteractionManager} interaction Handles mouse, touch and pointer events.
     * @property {PIXI.Prepare} prepare Pre-render display objects.
     */
    static __plugins: IRendererPlugins;
    /**
     * Adds a plugin to the renderer.
     *
     * @method
     * @param pluginName - The name of the plugin.
     * @param ctor - The constructor function or class for the plugin.
     */
    static registerPlugin(pluginName: string, ctor: IRendererPluginConstructor): void;
}

/**
 * A RenderTexture is a special texture that allows any PixiJS display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * __Hint-2__: The actual memory allocation will happen on first render.
 * You shouldn't create renderTextures each frame just to delete them after, try to reuse them.
 *
 * A RenderTexture takes a snapshot of any Display Object given to its render method. For example:
 *
 * ```js
 * let renderer = PIXI.autoDetectRenderer();
 * let renderTexture = PIXI.RenderTexture.create({ width: 800, height: 600 });
 * let sprite = PIXI.Sprite.from("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderer.render(sprite, renderTexture);
 * ```
 *
 * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
 * you can clear the transform
 *
 * ```js
 *
 * sprite.setTransform()
 *
 * let renderTexture = new PIXI.RenderTexture.create(100, 100);
 *
 * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.Texture
 * @memberof PIXI
 */
export declare class RenderTexture extends Texture {
    filterFrame: Rectangle | null;
    filterPoolKey: string | number | null;
    legacyRenderer: any;
    /**
     * @param {PIXI.BaseRenderTexture} baseRenderTexture - The base texture object that this texture uses
     * @param {PIXI.Rectangle} [frame] - The rectangle frame of the texture to show
     */
    constructor(baseRenderTexture: BaseRenderTexture, frame?: Rectangle);
    /**
     * Shortcut to `this.baseTexture.framebuffer`, saves baseTexture cast.
     * @member {PIXI.Framebuffer}
     * @readonly
     */
    get framebuffer(): Framebuffer;
    /**
     * Resizes the RenderTexture.
     *
     * @param {number} width - The width to resize to.
     * @param {number} height - The height to resize to.
     * @param {boolean} [resizeBaseTexture=true] - Should the baseTexture.width and height values be resized as well?
     */
    resize(width: number, height: number, resizeBaseTexture?: boolean): void;
    /**
     * Changes the resolution of baseTexture, but does not change framebuffer size.
     *
     * @param {number} resolution - The new resolution to apply to RenderTexture
     */
    setResolution(resolution: number): void;
    /**
     * A short hand way of creating a render texture.
     *
     * @param {object} [options] - Options
     * @param {number} [options.width=100] - The width of the render texture
     * @param {number} [options.height=100] - The height of the render texture
     * @param {number} [options.scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the texture being generated
     * @return {PIXI.RenderTexture} The new render texture
     */
    static create(options: IBaseTextureOptions): RenderTexture;
}

/**
 * Experimental!
 *
 * Texture pool, used by FilterSystem and plugins
 * Stores collection of temporary pow2 or screen-sized renderTextures
 *
 * If you use custom RenderTexturePool for your filters, you can use methods
 * `getFilterTexture` and `returnFilterTexture` same as in
 *
 * @class
 * @memberof PIXI
 */
export declare class RenderTexturePool {
    textureOptions: IBaseTextureOptions;
    enableFullScreen: boolean;
    texturePool: {
        [x in string | number]: RenderTexture[];
    };
    private _pixelsWidth;
    private _pixelsHeight;
    /**
     * @param {object} [textureOptions] - options that will be passed to BaseRenderTexture constructor
     * @param {PIXI.SCALE_MODES} [textureOptions.scaleMode] - See {@link PIXI.SCALE_MODES} for possible values.
     */
    constructor(textureOptions?: IBaseTextureOptions);
    /**
     * creates of texture with params that were specified in pool constructor
     *
     * @param {number} realWidth - width of texture in pixels
     * @param {number} realHeight - height of texture in pixels
     * @returns {RenderTexture}
     */
    createTexture(realWidth: number, realHeight: number): RenderTexture;
    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     *
     * @protected
     * @param {number} minWidth - The minimum width of the render texture in real pixels.
     * @param {number} minHeight - The minimum height of the render texture in real pixels.
     * @param {number} [resolution=1] - The resolution of the render texture.
     * @return {PIXI.RenderTexture} The new render texture.
     */
    getOptimalTexture(minWidth: number, minHeight: number, resolution?: number): RenderTexture;
    /**
     * Gets extra texture of the same size as input renderTexture
     *
     * `getFilterTexture(input, 0.5)` or `getFilterTexture(0.5, input)`
     *
     * @param {PIXI.RenderTexture} input - renderTexture from which size and resolution will be copied
     * @param {number} [resolution] - override resolution of the renderTexture
     *  It overrides, it does not multiply
     * @returns {PIXI.RenderTexture}
     */
    getFilterTexture(input: RenderTexture, resolution: number): RenderTexture;
    /**
     * Place a render texture back into the pool.
     * @param {PIXI.RenderTexture} renderTexture - The renderTexture to free
     */
    returnTexture(renderTexture: RenderTexture): void;
    /**
     * Alias for returnTexture, to be compliant with FilterSystem interface
     * @param {PIXI.RenderTexture} renderTexture - The renderTexture to free
     */
    returnFilterTexture(renderTexture: RenderTexture): void;
    /**
     * Clears the pool
     *
     * @param {boolean} [destroyTextures=true] - destroy all stored textures
     */
    clear(destroyTextures: boolean): void;
    /**
     * If screen size was changed, drops all screen-sized textures,
     * sets new screen size, sets `enableFullScreen` to true
     *
     * Size is measured in pixels, `renderer.view` can be passed here, not `renderer.screen`
     *
     * @param {PIXI.ISize} size - Initial size of screen
     */
    setScreenSize(size: ISize): void;
    /**
     * Key that is used to store fullscreen renderTextures in a pool
     *
     * @static
     * @const {string}
     */
    static SCREEN_KEY: string;
}

/**
 * System plugin to the renderer to manage render textures.
 *
 * Should be added after FramebufferSystem
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class RenderTextureSystem extends System {
    clearColor: number[];
    defaultMaskStack: Array<MaskData>;
    current: RenderTexture;
    readonly sourceFrame: Rectangle;
    readonly destinationFrame: Rectangle;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Bind the current render texture
     *
     * @param {PIXI.RenderTexture} [renderTexture] - RenderTexture to bind, by default its `null`, the screen
     * @param {PIXI.Rectangle} [sourceFrame] - part of screen that is mapped to the renderTexture
     * @param {PIXI.Rectangle} [destinationFrame] - part of renderTexture, by default it has the same size as sourceFrame
     */
    bind(renderTexture?: RenderTexture, sourceFrame?: Rectangle, destinationFrame?: Rectangle): void;
    /**
     * Erases the render texture and fills the drawing area with a colour
     *
     * @param {number[]} [clearColor] - The color as rgba, default to use the renderer backgroundColor
     * @param {PIXI.BUFFER_BITS} [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
     *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
     * @return {PIXI.Renderer} Returns itself.
     */
    clear(clearColor?: number[], mask?: BUFFER_BITS): void;
    resize(): void;
    /**
     * Resets renderTexture state
     */
    reset(): void;
}

/**
 * Base resource class for textures that manages validation and uploading, depending on its type.
 *
 * Uploading of a base texture to the GPU is required.
 *
 * @class
 * @memberof PIXI.resources
 */
declare abstract class Resource {
    destroyed: boolean;
    internal: boolean;
    protected _width: number;
    protected _height: number;
    protected onResize: Runner;
    protected onUpdate: Runner;
    protected onError: Runner;
    /**
     * @param {number} [width=0] - Width of the resource
     * @param {number} [height=0] - Height of the resource
     */
    constructor(width?: number, height?: number);
    /**
     * Bind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    bind(baseTexture: BaseTexture): void;
    /**
     * Unbind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    unbind(baseTexture: BaseTexture): void;
    /**
     * Trigger a resize event
     * @param {number} width - X dimension
     * @param {number} height - Y dimension
     */
    resize(width: number, height: number): void;
    /**
     * Has been validated
     * @readonly
     * @member {boolean}
     */
    get valid(): boolean;
    /**
     * Has been updated trigger event
     */
    update(): void;
    /**
     * This can be overridden to start preloading a resource
     * or do any other prepare step.
     * @protected
     * @return {Promise<void>} Handle the validate event
     */
    load(): Promise<Resource>;
    /**
     * The width of the resource.
     *
     * @member {number}
     * @readonly
     */
    get width(): number;
    /**
     * The height of the resource.
     *
     * @member {number}
     * @readonly
     */
    get height(): number;
    /**
     * Uploads the texture or returns false if it cant for some reason. Override this.
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
     * @returns {boolean} true is success
     */
    abstract upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;
    /**
     * Set the style, optional to override
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
     * @returns {boolean} `true` is success
     */
    style(_renderer: Renderer, _baseTexture: BaseTexture, _glTexture: GLTexture): boolean;
    /**
     * Clean up anything, this happens when destroying is ready.
     *
     * @protected
     */
    dispose(): void;
    /**
     * Call when destroying resource, unbind any BaseTexture object
     * before calling this method, as reference counts are maintained
     * internally.
     */
    destroy(): void;
    /**
     * Abstract, used to auto-detect resource type
     *
     * @static
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     */
    static test(_source: unknown, _extension?: string): boolean;
}

export declare const resources: {
    autoDetectResource: typeof autoDetectResource;
    Resource: typeof Resource;
    AbstractMultiResource: typeof AbstractMultiResource;
    ArrayResource: typeof ArrayResource;
    BaseImageResource: typeof BaseImageResource;
    BufferResource: typeof BufferResource;
    CanvasResource: typeof CanvasResource;
    CubeResource: typeof CubeResource;
    ImageResource: typeof ImageResource;
    SVGResource: typeof SVGResource;
    VideoResource: typeof VideoResource;
    ImageBitmapResource: typeof ImageBitmapResource;
};

/**
 * System plugin to the renderer to manage scissor rects (used for masks).
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class ScissorSystem extends AbstractMaskSystem {
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    getStackLength(): number;
    /**
     * Applies the Mask and adds it to the current stencil stack. @alvin
     *
     * @param {PIXI.MaskData} maskData - The mask data
     */
    push(maskData: MaskData): void;
    /**
     * Pops scissor mask. MaskData is already removed from stack
     */
    pop(): void;
    /**
     * Setup renderer to use the current scissor data.
     * @private
     */
    _useCurrent(): void;
}

/**
 * A helper class for shaders
 *
 * @class
 * @memberof PIXI
 */
export declare class Shader {
    program: Program;
    uniformGroup: UniformGroup;
    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(program: Program, uniforms: Dict<any>);
    checkUniformExists(name: string, group: UniformGroup): boolean;
    destroy(): void;
    /**
     * Shader uniform values, shortcut for `uniformGroup.uniforms`
     * @readonly
     * @member {object}
     */
    get uniforms(): Dict<any>;
    /**
     * A short hand function to create a shader based of a vertex and fragment shader
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     *
     * @returns {PIXI.Shader} an shiny new Pixi shader!
     */
    static from(vertexSrc?: string, fragmentSrc?: string, uniforms?: Dict<any>): Shader;
}

/**
 * System plugin to the renderer to manage shaders.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
declare class ShaderSystem extends System {
    protected gl: IRenderingContext;
    shader: Shader;
    program: Program;
    id: number;
    destroyed: boolean;
    private cache;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Overrideable function by `@pixi/unsafe-eval` to silence
     * throwing an error if platform doesn't support unsafe-evals.
     *
     * @private
     */
    systemCheck(): void;
    protected contextChange(gl: IRenderingContext): void;
    /**
     * Changes the current shader to the one given in parameter
     *
     * @param {PIXI.Shader} shader - the new shader
     * @param {boolean} [dontSync] - false if the shader should automatically sync its uniforms.
     * @returns {PIXI.GLProgram} the glProgram that belongs to the shader.
     */
    bind(shader: Shader, dontSync?: boolean): GLProgram;
    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms values that be applied to the current shader
     */
    setUniforms(uniforms: Dict<any>): void;
    /**
     *
     * syncs uniforms on the group
     * @param {*} group - the uniform group to sync
     * @param {*} [syncData] - this is data that is passed to the sync function and any nested sync functions
     */
    syncUniformGroup(group: UniformGroup, syncData?: any): void;
    /**
     * Overrideable by the @pixi/unsafe-eval package to use static
     * syncUnforms instead.
     *
     * @private
     */
    syncUniforms(group: UniformGroup, glProgram: GLProgram, syncData: any): void;
    createSyncGroups(group: UniformGroup): UniformsSyncCallback;
    /**
     * Takes a uniform group and data and generates a unique signature for them.
     *
     * @param {PIXI.UniformGroup} group - the uniform group to get signature of
     * @param {Object} uniformData - uniform information generated by the shader
     * @returns {String} Unique signature of the uniform group
     * @private
     */
    private getSignature;
    /**
     * Returns the underlying GLShade rof the currently bound shader.
     * This can be handy for when you to have a little more control over the setting of your uniforms.
     *
     * @return {PIXI.GLProgram} the glProgram for the currently bound Shader for this context
     */
    getglProgram(): GLProgram;
    /**
     * Generates a glProgram version of the Shader provided.
     *
     * @private
     * @param {PIXI.Shader} shader - the shader that the glProgram will be based on.
     * @return {PIXI.GLProgram} A shiny new glProgram!
     */
    generateShader(shader: Shader): GLProgram;
    /**
     * Resets ShaderSystem state, does not affect WebGL state
     */
    reset(): void;
    /**
     * Destroys this System and removes all its textures
     */
    destroy(): void;
}

/**
 * This handles a Sprite acting as a mask, as opposed to a Graphic.
 *
 * WebGL only.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 */
export declare class SpriteMaskFilter extends Filter {
    maskSprite: IMaskTarget;
    maskMatrix: Matrix;
    /**
     * @param {PIXI.Sprite} sprite - the target sprite
     */
    constructor(sprite: IMaskTarget);
    /**
     * Applies the filter
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {PIXI.CLEAR_MODES} clearMode - Should the output be cleared before rendering to it.
     */
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
}

/**
 * This is a WebGL state, and is is passed The WebGL StateManager.
 *
 * Each mesh rendered may require WebGL to be in a different state.
 * For example you may want different blend mode or to enable polygon offsets
 *
 * @class
 * @memberof PIXI
 */
export declare class State {
    data: number;
    _blendMode: BLEND_MODES;
    _polygonOffset: number;
    constructor();
    /**
     * Activates blending of the computed fragment color values
     *
     * @member {boolean}
     */
    get blend(): boolean;
    set blend(value: boolean);
    /**
     * Activates adding an offset to depth values of polygon's fragments
     *
     * @member {boolean}
     * @default false
     */
    get offsets(): boolean;
    set offsets(value: boolean);
    /**
     * Activates culling of polygons.
     *
     * @member {boolean}
     * @default false
     */
    get culling(): boolean;
    set culling(value: boolean);
    /**
     * Activates depth comparisons and updates to the depth buffer.
     *
     * @member {boolean}
     * @default false
     */
    get depthTest(): boolean;
    set depthTest(value: boolean);
    /**
     * Enables or disables writing to the depth buffer.
     *
     * @member {boolean}
     * @default true
     */
    get depthMask(): boolean;
    set depthMask(value: boolean);
    /**
     * Specifies whether or not front or back-facing polygons can be culled.
     * @member {boolean}
     * @default false
     */
    get clockwiseFrontFace(): boolean;
    set clockwiseFrontFace(value: boolean);
    /**
     * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    get blendMode(): BLEND_MODES;
    set blendMode(value: BLEND_MODES);
    /**
     * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
     *
     * @member {number}
     * @default 0
     */
    get polygonOffset(): number;
    set polygonOffset(value: number);
    static for2d(): State;
}

/**
 * System plugin to the renderer to manage WebGL state machines.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class StateSystem extends System {
    stateId: number;
    polygonOffset: number;
    blendMode: BLEND_MODES;
    protected _blendEq: boolean;
    protected gl: IRenderingContext;
    protected blendModes: number[][];
    protected readonly map: Array<(value: boolean) => void>;
    protected readonly checks: Array<(system: this, state: State) => void>;
    protected defaultState: State;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    contextChange(gl: IRenderingContext): void;
    /**
     * Sets the current state
     *
     * @param {*} state - The state to set.
     */
    set(state: State): void;
    /**
     * Sets the state, when previous state is unknown
     *
     * @param {*} state - The state to set
     */
    forceState(state: State): void;
    /**
     * Enables or disabled blending.
     *
     * @param {boolean} value - Turn on or off webgl blending.
     */
    setBlend(value: boolean): void;
    /**
     * Enables or disable polygon offset fill
     *
     * @param {boolean} value - Turn on or off webgl polygon offset testing.
     */
    setOffset(value: boolean): void;
    /**
     * Sets whether to enable or disable depth test.
     *
     * @param {boolean} value - Turn on or off webgl depth testing.
     */
    setDepthTest(value: boolean): void;
    /**
     * Sets whether to enable or disable depth mask.
     *
     * @param {boolean} value - Turn on or off webgl depth mask.
     */
    setDepthMask(value: boolean): void;
    /**
     * Sets whether to enable or disable cull face.
     *
     * @param {boolean} value - Turn on or off webgl cull face.
     */
    setCullFace(value: boolean): void;
    /**
     * Sets the gl front face.
     *
     * @param {boolean} value - true is clockwise and false is counter-clockwise
     */
    setFrontFace(value: boolean): void;
    /**
     * Sets the blend mode.
     *
     * @param {number} value - The blend mode to set to.
     */
    setBlendMode(value: number): void;
    /**
     * Sets the polygon offset.
     *
     * @param {number} value - the polygon offset
     * @param {number} scale - the polygon offset scale
     */
    setPolygonOffset(value: number, scale: number): void;
    /**
     * Resets all the logic and disables the vaos
     */
    reset(): void;
    /**
     * checks to see which updates should be checked based on which settings have been activated.
     * For example, if blend is enabled then we should check the blend modes each time the state is changed
     * or if polygon fill is activated then we need to check if the polygon offset changes.
     * The idea is that we only check what we have too.
     *
     * @param {Function} func - the checking function to add or remove
     * @param {boolean} value - should the check function be added or removed.
     */
    updateCheck(func: (system: this, state: State) => void, value: boolean): void;
    /**
     * A private little wrapper function that we call to check the blend mode.
     *
     * @static
     * @private
     * @param {PIXI.StateSystem} System - the System to perform the state check on
     * @param {PIXI.State} state - the state that the blendMode will pulled from
     */
    static checkBlendMode(system: StateSystem, state: State): void;
    /**
     * A private little wrapper function that we call to check the polygon offset.
     *
     * @static
     * @private
     * @param {PIXI.StateSystem} System - the System to perform the state check on
     * @param {PIXI.State} state - the state that the blendMode will pulled from
     */
    static checkPolygonOffset(system: StateSystem, state: State): void;
}

/**
 * System plugin to the renderer to manage stencils (used for masks).
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class StencilSystem extends AbstractMaskSystem {
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    getStackLength(): number;
    /**
     * Applies the Mask and adds it to the current stencil stack.
     *
     * @param {PIXI.MaskData} maskData - The mask data
     */
    push(maskData: MaskData): void;
    /**
     * Pops stencil mask. MaskData is already removed from stack
     *
     * @param {PIXI.DisplayObject} maskObject - object of popped mask data
     */
    pop(maskObject: IMaskTarget): void;
    /**
     * Setup renderer to use the current stencil data.
     * @private
     */
    _useCurrent(): void;
    /**
     * Fill 1s equal to the number of acitve stencil masks.
     * @private
     * @return {number} The bitwise mask.
     */
    _getBitwiseMask(): number;
}

/**
 * Resource type for SVG elements and graphics.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {string} source - Base64 encoded SVG element or URL for SVG file.
 * @param {object} [options] - Options to use
 * @param {number} [options.scale=1] - Scale to apply to SVG. Overridden by...
 * @param {number} [options.width] - Rasterize SVG this wide. Aspect ratio preserved if height not specified.
 * @param {number} [options.height] - Rasterize SVG this high. Aspect ratio preserved if width not specified.
 * @param {boolean} [options.autoLoad=true] - Start loading right away.
 */
declare class SVGResource extends BaseImageResource {
    readonly svg: string;
    readonly scale: number;
    readonly _overrideWidth: number;
    readonly _overrideHeight: number;
    private _resolve;
    private _load;
    private _crossorigin?;
    constructor(sourceBase64: string, options: ISVGResourceOptions);
    load(): Promise<SVGResource>;
    /**
     * Loads an SVG image from `imageUrl` or `data URL`.
     *
     * @private
     */
    private _loadSvg;
    /**
     * Get size from an svg string using regexp.
     *
     * @method
     * @param {string} svgString - a serialized svg element
     * @return {PIXI.ISize} image extension
     */
    static getSize(svgString?: string): ISize;
    /**
     * Destroys this texture
     * @override
     */
    dispose(): void;
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     */
    static test(source: unknown, extension?: string): boolean;
    /**
     * RegExp for SVG size.
     *
     * @static
     * @constant {RegExp|string} SVG_SIZE
     * @memberof PIXI.resources.SVGResource
     * @example &lt;svg width="100" height="100"&gt;&lt;/svg&gt;
     */
    static SVG_SIZE: RegExp;
}

/**
 * System is a base class used for extending systems used by the {@link PIXI.Renderer}
 *
 * @see PIXI.Renderer#addSystem
 * @class
 * @memberof PIXI
 */
export declare class System {
    renderer: Renderer;
    /**
     * @param {Renderer} renderer - The renderer this manager works for.
     */
    constructor(renderer: Renderer);
    /**
     * Generic destroy methods to be overridden by the subclass
     */
    destroy(): void;
}

export declare const systems: {
    FilterSystem: typeof FilterSystem;
    BatchSystem: typeof BatchSystem;
    ContextSystem: typeof ContextSystem;
    FramebufferSystem: typeof FramebufferSystem;
    GeometrySystem: typeof GeometrySystem;
    MaskSystem: typeof MaskSystem;
    ScissorSystem: typeof ScissorSystem;
    StencilSystem: typeof StencilSystem;
    ProjectionSystem: typeof ProjectionSystem;
    RenderTextureSystem: typeof RenderTextureSystem;
    ShaderSystem: typeof ShaderSystem;
    StateSystem: typeof StateSystem;
    TextureGCSystem: typeof TextureGCSystem;
    TextureSystem: typeof TextureSystem;
};

export declare interface systems {
    FilterSystem: FilterSystem;
    BatchSystem: BatchSystem;
    ContextSystem: ContextSystem;
    FramebufferSystem: FramebufferSystem;
    GeometrySystem: GeometrySystem;
    MaskSystem: MaskSystem;
    ScissorSystem: ScissorSystem;
    StencilSystem: StencilSystem;
    ProjectionSystem: ProjectionSystem;
    RenderTextureSystem: RenderTextureSystem;
    ShaderSystem: ShaderSystem;
    StateSystem: StateSystem;
    TextureGCSystem: TextureGCSystem;
    TextureSystem: TextureSystem;
}

export declare interface Texture extends GlobalMixins.Texture, EventEmitter {
}

/**
 * A texture stores the information that represents an image or part of an image.
 *
 * It cannot be added to the display list directly; instead use it as the texture for a Sprite.
 * If no frame is provided for a texture, then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * let texture = PIXI.Texture.from('assets/image.png');
 * let sprite1 = new PIXI.Sprite(texture);
 * let sprite2 = new PIXI.Sprite(texture);
 * ```
 *
 * If you didnt pass the texture frame to constructor, it enables `noFrame` mode:
 * it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture.
 *
 * Textures made from SVGs, loaded or not, cannot be used before the file finishes processing.
 * You can check for this by checking the sprite's _textureID property.
 * ```js
 * var texture = PIXI.Texture.from('assets/image.svg');
 * var sprite1 = new PIXI.Sprite(texture);
 * //sprite1._textureID should not be undefined if the texture has finished processing the SVG file
 * ```
 * You can use a ticker or rAF to ensure your sprites load the finished textures after processing. See issue #3068.
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export declare class Texture extends EventEmitter {
    baseTexture: BaseTexture;
    orig: Rectangle;
    trim: Rectangle;
    valid: boolean;
    noFrame: boolean;
    defaultAnchor: Point;
    uvMatrix: TextureMatrix;
    protected _rotate: number;
    _updateID: number;
    _frame: Rectangle;
    _uvs: TextureUvs;
    textureCacheIds: Array<string>;
    /**
     * @param {PIXI.BaseTexture} baseTexture - The base texture source to create the texture from
     * @param {PIXI.Rectangle} [frame] - The rectangle frame of the texture to show
     * @param {PIXI.Rectangle} [orig] - The area of original texture
     * @param {PIXI.Rectangle} [trim] - Trimmed rectangle of original texture
     * @param {number} [rotate] - indicates how the texture was rotated by texture packer. See {@link PIXI.groupD8}
     * @param {PIXI.IPointData} [anchor] - Default anchor point used for sprite placement / rotation
     */
    constructor(baseTexture: BaseTexture, frame?: Rectangle, orig?: Rectangle, trim?: Rectangle, rotate?: number, anchor?: IPointData);
    /**
     * Updates this texture on the gpu.
     *
     * Calls the TextureResource update.
     *
     * If you adjusted `frame` manually, please call `updateUvs()` instead.
     *
     */
    update(): void;
    /**
     * Called when the base texture is updated
     *
     * @protected
     * @param {PIXI.BaseTexture} baseTexture - The base texture.
     */
    onBaseTextureUpdated(baseTexture: BaseTexture): void;
    /**
     * Destroys this texture
     *
     * @param {boolean} [destroyBase=false] - Whether to destroy the base texture as well
     */
    destroy(destroyBase?: boolean): void;
    /**
     * Creates a new texture object that acts the same as this one.
     *
     * @return {PIXI.Texture} The new texture
     */
    clone(): Texture;
    /**
     * Updates the internal WebGL UV cache. Use it after you change `frame` or `trim` of the texture.
     * Call it after changing the frame
     */
    updateUvs(): void;
    /**
     * Helper function that creates a new Texture based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|PIXI.BaseTexture} source -
     *        Source to create texture from
     * @param {object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
     * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
     * @return {PIXI.Texture} The newly created texture
     */
    static from(source: TextureSource, options?: IBaseTextureOptions, strict?: boolean): Texture;
    /**
     * Useful for loading textures via URLs. Use instead of `Texture.from` because
     * it does a better job of handling failed URLs more effectively. This also ignores
     * `PIXI.settings.STRICT_TEXTURE_CACHE`. Works for Videos, SVGs, Images.
     * @param {string} url The remote URL to load.
     * @param {object} [options] Optional options to include
     * @return {Promise<PIXI.Texture>} A Promise that resolves to a Texture.
     */
    static fromURL(url: string, options?: IBaseTextureOptions): Promise<Texture>;
    /**
     * Create a new Texture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @static
     * @param {Float32Array|Uint8Array} buffer - The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param {number} width - Width of the resource
     * @param {number} height - Height of the resource
     * @param {object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.Texture} The resulting new BaseTexture
     */
    static fromBuffer(buffer: Float32Array | Uint8Array, width: number, height: number, options: IBaseTextureOptions): Texture;
    /**
     * Create a texture from a source and add to the cache.
     *
     * @static
     * @param {HTMLImageElement|HTMLCanvasElement} source - The input source.
     * @param {String} imageUrl - File name of texture, for cache and resolving resolution.
     * @param {String} [name] - Human readable name for the texture cache. If no name is
     *        specified, only `imageUrl` will be used as the cache ID.
     * @return {PIXI.Texture} Output texture
     */
    static fromLoader(source: HTMLImageElement | HTMLCanvasElement, imageUrl: string, name: string): Texture;
    /**
     * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.Texture} texture - The Texture to add to the cache.
     * @param {string} id - The id that the Texture will be stored against.
     */
    static addToCache(texture: Texture, id: string): void;
    /**
     * Remove a Texture from the global TextureCache.
     *
     * @static
     * @param {string|PIXI.Texture} texture - id of a Texture to be removed, or a Texture instance itself
     * @return {PIXI.Texture|null} The Texture that was removed
     */
    static removeFromCache(texture: string | Texture): Texture | null;
    /**
     * Returns resolution of baseTexture
     *
     * @member {number}
     * @readonly
     */
    get resolution(): number;
    /**
     * The frame specifies the region of the base texture that this texture uses.
     * Please call `updateUvs()` after you change coordinates of `frame` manually.
     *
     * @member {PIXI.Rectangle}
     */
    get frame(): Rectangle;
    set frame(frame: Rectangle);
    /**
     * Indicates whether the texture is rotated inside the atlas
     * set to 2 to compensate for texture packer rotation
     * set to 6 to compensate for spine packer rotation
     * can be used to rotate or mirror sprites
     * See {@link PIXI.groupD8} for explanation
     *
     * @member {number}
     */
    get rotate(): number;
    set rotate(rotate: number);
    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    get width(): number;
    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    get height(): number;
    /**
     * Utility function for BaseTexture|Texture cast
     */
    castToBaseTexture(): BaseTexture;
    static readonly EMPTY: Texture;
    static readonly WHITE: Texture;
}

/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
declare class TextureGCSystem extends System {
    count: number;
    checkCount: number;
    maxIdle: number;
    checkCountMax: number;
    mode: number;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    protected postrender(): void;
    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    run(): void;
    /**
     * Removes all the textures within the specified displayObject and its children from the GPU
     *
     * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
     */
    unload(displayObject: IUnloadableTexture): void;
}

/**
 * Class controls uv mapping from Texture normal space to BaseTexture normal space.
 *
 * Takes `trim` and `rotate` into account. May contain clamp settings for Meshes and TilingSprite.
 *
 * Can be used in Texture `uvMatrix` field, or separately, you can use different clamp settings on the same texture.
 * If you want to add support for texture region of certain feature or filter, that's what you're looking for.
 *
 * Takes track of Texture changes through `_lastTextureID` private field.
 * Use `update()` method call to track it from outside.
 *
 * @see PIXI.Texture
 * @see PIXI.Mesh
 * @see PIXI.TilingSprite
 * @class
 * @memberof PIXI
 */
export declare class TextureMatrix {
    mapCoord: Matrix;
    clampOffset: number;
    clampMargin: number;
    readonly uClampFrame: Float32Array;
    readonly uClampOffset: Float32Array;
    _textureID: number;
    _updateID: number;
    _texture: Texture;
    isSimple: boolean;
    /**
     *
     * @param {PIXI.Texture} texture - observed texture
     * @param {number} [clampMargin] - Changes frame clamping, 0.5 by default. Use -0.5 for extra border.
     * @constructor
     */
    constructor(texture: Texture, clampMargin?: number);
    /**
     * texture property
     * @member {PIXI.Texture}
     */
    get texture(): Texture;
    set texture(value: Texture);
    /**
     * Multiplies uvs array to transform
     * @param {Float32Array} uvs - mesh uvs
     * @param {Float32Array} [out=uvs] - output
     * @returns {Float32Array} output
     */
    multiplyUvs(uvs: Float32Array, out?: Float32Array): Float32Array;
    /**
     * updates matrices if texture was changed
     * @param {boolean} [forceUpdate=false] - if true, matrices will be updated any case
     * @returns {boolean} whether or not it was updated
     */
    update(forceUpdate?: boolean): boolean;
}

export declare type TextureSource = string | BaseTexture | ImageSource;

/**
 * System plugin to the renderer to manage textures.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
declare class TextureSystem extends System {
    boundTextures: BaseTexture[];
    managedTextures: Array<BaseTexture>;
    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;
    protected webGLVersion: number;
    protected unknownTexture: BaseTexture;
    protected _unknownBoundTextures: boolean;
    currentLocation: number;
    emptyTextures: {
        [key: number]: GLTexture;
    };
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer);
    /**
     * Sets up the renderer context and necessary buffers.
     */
    contextChange(): void;
    /**
     * Bind a texture to a specific location
     *
     * If you want to unbind something, please use `unbind(texture)` instead of `bind(null, textureLocation)`
     *
     * @param {PIXI.Texture|PIXI.BaseTexture} texture_ - Texture to bind
     * @param {number} [location=0] - Location to bind at
     */
    bind(texture: Texture | BaseTexture, location?: number): void;
    /**
     * Resets texture location and bound textures
     *
     * Actual `bind(null, i)` calls will be performed at next `unbind()` call
     */
    reset(): void;
    /**
     * Unbind a texture
     * @param {PIXI.BaseTexture} texture - Texture to bind
     */
    unbind(texture?: BaseTexture): void;
    /**
     * Initialize a texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to initialize
     */
    initTexture(texture: BaseTexture): GLTexture;
    initTextureType(texture: BaseTexture, glTexture: GLTexture): void;
    /**
     * Update a texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to initialize
     */
    updateTexture(texture: BaseTexture): void;
    /**
     * Deletes the texture from WebGL
     *
     * @private
     * @param {PIXI.BaseTexture|PIXI.Texture} texture_ - the texture to destroy
     * @param {boolean} [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
     */
    destroyTexture(texture: BaseTexture | Texture, skipRemove?: boolean): void;
    /**
     * Update texture style such as mipmap flag
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to update
     */
    updateTextureStyle(texture: BaseTexture): void;
    /**
     * Set style for texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to update
     * @param {PIXI.GLTexture} glTexture
     */
    setStyle(texture: BaseTexture, glTexture: GLTexture): void;
}

/**
 * Stores a texture's frame in UV coordinates, in
 * which everything lies in the rectangle `[(0,0), (1,0),
 * (1,1), (0,1)]`.
 *
 * | Corner       | Coordinates |
 * |--------------|-------------|
 * | Top-Left     | `(x0,y0)`   |
 * | Top-Right    | `(x1,y1)`   |
 * | Bottom-Right | `(x2,y2)`   |
 * | Bottom-Left  | `(x3,y3)`   |
 *
 * @class
 * @protected
 * @memberof PIXI
 */
export declare class TextureUvs {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    uvsFloat32: Float32Array;
    constructor();
    /**
     * Sets the texture Uvs based on the given frame information.
     *
     * @protected
     * @param {PIXI.Rectangle} frame - The frame of the texture
     * @param {PIXI.Rectangle} baseFrame - The base frame of the texture
     * @param {number} rotate - Rotation of frame, see {@link PIXI.groupD8}
     */
    set(frame: Rectangle, baseFrame: ISize, rotate: number): void;
}

/**
 * Uniform group holds uniform map and some ID's for work
 *
 * @class
 * @memberof PIXI
 */
export declare class UniformGroup {
    readonly uniforms: Dict<any>;
    readonly group: boolean;
    id: number;
    syncUniforms: Dict<UniformsSyncCallback>;
    dirtyId: number;
    static: boolean;
    /**
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     * @param {boolean} [_static] - Uniforms wont be changed after creation
     */
    constructor(uniforms: Dict<any>, _static?: boolean);
    update(): void;
    add(name: string, uniforms: Dict<any>, _static: boolean): void;
    static from(uniforms: Dict<any>, _static: boolean): UniformGroup;
}

export declare const uniformParsers: IUniformParser[];

declare type UniformsSyncCallback = (...args: any[]) => void;

/**
 * Resource type for HTMLVideoElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
 * @param {object} [options] - Options to use
 * @param {boolean} [options.autoLoad=true] - Start loading the video immediately
 * @param {boolean} [options.autoPlay=true] - Start playing video immediately
 * @param {number} [options.updateFPS=0] - How many times a second to update the texture from the video.
 * Leave at 0 to update at every render.
 * @param {boolean} [options.crossorigin=true] - Load image using cross origin
 */
declare class VideoResource extends BaseImageResource {
    protected _autoUpdate: boolean;
    protected _isConnectedToTicker: boolean;
    protected _updateFPS: number;
    protected _msToNextUpdate: number;
    protected autoPlay: boolean;
    private _load;
    private _resolve;
    constructor(source?: HTMLVideoElement | Array<string | IVideoResourceOptionsElement> | string, options?: IVideoResourceOptions);
    /**
     * Trigger updating of the texture
     *
     * @param {number} [deltaTime=0] - time delta since last tick
     */
    update(_deltaTime?: number): void;
    /**
     * Start preloading the video resource.
     *
     * @protected
     * @return {Promise<void>} Handle the validate event
     */
    load(): Promise<VideoResource>;
    /**
     * Handle video error events.
     *
     * @private
     */
    private _onError;
    /**
     * Returns true if the underlying source is playing.
     *
     * @private
     * @return {boolean} True if playing.
     */
    private _isSourcePlaying;
    /**
     * Returns true if the underlying source is ready for playing.
     *
     * @private
     * @return {boolean} True if ready.
     */
    private _isSourceReady;
    /**
     * Runs the update loop when the video is ready to play
     *
     * @private
     */
    private _onPlayStart;
    /**
     * Fired when a pause event is triggered, stops the update loop
     *
     * @private
     */
    private _onPlayStop;
    /**
     * Fired when the video is loaded and ready to play
     *
     * @private
     */
    private _onCanPlay;
    /**
     * Destroys this texture
     * @override
     */
    dispose(): void;
    /**
     * Should the base texture automatically update itself, set to true by default
     *
     * @member {boolean}
     */
    get autoUpdate(): boolean;
    set autoUpdate(value: boolean);
    /**
     * How many times a second to update the texture from the video. Leave at 0 to update at every render.
     * A lower fps can help performance, as updating the texture at 60fps on a 30ps video may not be efficient.
     *
     * @member {number}
     */
    get updateFPS(): number;
    set updateFPS(value: number);
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     * @return {boolean} `true` if video source
     */
    static test(source: unknown, extension?: string): source is HTMLVideoElement;
    /**
     * List of common video file extensions supported by VideoResource.
     * @constant
     * @member {Array<string>}
     * @static
     * @readonly
     */
    static TYPES: string[];
    /**
     * Map of video MIME types that can't be directly derived from file extensions.
     * @constant
     * @member {object}
     * @static
     * @readonly
     */
    static MIME_TYPES: Dict<string>;
}

/**
 * Flexible wrapper around `ArrayBuffer` that also provides
 * typed array views on demand.
 *
 * @class
 * @memberof PIXI
 */
export declare class ViewableBuffer {
    size: number;
    rawBinaryData: ArrayBuffer;
    uint32View: Uint32Array;
    float32View: Float32Array;
    private _int8View;
    private _uint8View;
    private _int16View;
    private _uint16View;
    private _int32View;
    /**
     * @param {number} size - The size of the buffer in bytes.
     */
    constructor(size: number);
    /**
     * View on the raw binary data as a `Int8Array`.
     *
     * @member {Int8Array}
     */
    get int8View(): Int8Array;
    /**
     * View on the raw binary data as a `Uint8Array`.
     *
     * @member {Uint8Array}
     */
    get uint8View(): Uint8Array;
    /**
     * View on the raw binary data as a `Int16Array`.
     *
     * @member {Int16Array}
     */
    get int16View(): Int16Array;
    /**
     * View on the raw binary data as a `Uint16Array`.
     *
     * @member {Uint16Array}
     */
    get uint16View(): Uint16Array;
    /**
     * View on the raw binary data as a `Int32Array`.
     *
     * @member {Int32Array}
     */
    get int32View(): Int32Array;
    /**
     * Returns the view of the given type.
     *
     * @param {string} type - One of `int8`, `uint8`, `int16`,
     *    `uint16`, `int32`, `uint32`, and `float32`.
     * @return {object} typed array of given type
     */
    view(type: string): ITypedArray;
    /**
     * Destroys all buffer references. Do not use after calling
     * this.
     */
    destroy(): void;
    static sizeOf(type: string): number;
}

export { }
