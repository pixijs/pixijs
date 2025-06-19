/**
 * Collection of valid extension types.
 * @category extensions
 * @advanced
 */
enum ExtensionType
{
    /** extensions that are registered as Application plugins */
    Application = 'application',

    /** extensions that are registered as WebGL render pipes */
    WebGLPipes = 'webgl-pipes',
    /** extensions that are registered as WebGL render pipes adaptors */
    WebGLPipesAdaptor = 'webgl-pipes-adaptor',
    /** extensions that are registered as WebGL render systems */
    WebGLSystem = 'webgl-system',

    /** extensions that are registered as WebGPU render pipes */
    WebGPUPipes = 'webgpu-pipes',
    /** extensions that are registered as WebGPU render pipes adaptors */
    WebGPUPipesAdaptor = 'webgpu-pipes-adaptor',
    /** extensions that are registered as WebGPU render systems */
    WebGPUSystem = 'webgpu-system',

    /** extensions that are registered as Canvas render pipes */
    CanvasSystem = 'canvas-system',
    /** extensions that are registered as Canvas render pipes adaptors */
    CanvasPipesAdaptor = 'canvas-pipes-adaptor',
    /** extensions that are registered as Canvas render systems */
    CanvasPipes = 'canvas-pipes',

    /** extensions that combine the other Asset extensions */
    Asset = 'asset',
    /** extensions that are used to load assets through Assets */
    LoadParser = 'load-parser',
    /** extensions that are used to resolve asset urls through Assets */
    ResolveParser = 'resolve-parser',
    /** extensions that are used to handle how urls are cached by Assets */
    CacheParser = 'cache-parser',
    /** extensions that are used to add/remove available resources from Assets */
    DetectionParser = 'detection-parser',

    /** extensions that are registered with the MaskEffectManager */
    MaskEffect = 'mask-effect',

    /** A type of extension for creating a new advanced blend mode */
    BlendMode = 'blend-mode',

    /** A type of extension that will be used to auto detect a resource type */
    TextureSource = 'texture-source',

    /** A type of extension that will be used to auto detect an environment */
    Environment = 'environment',

    /** A type of extension for building and triangulating custom shapes used in graphics. */
    ShapeBuilder = 'shape-builder',

    /** A type of extension for creating custom batchers used in rendering. */
    Batcher = 'batcher',
}

/**
 * The metadata for an extension.
 * @category extensions
 * @ignore
 */
interface ExtensionMetadataDetails
{
    /** The extension type, can be multiple types */
    type: ExtensionType | ExtensionType[];
    /** Optional. Some plugins provide an API name/property, to make them more easily accessible */
    name?: string;
    /** Optional, used for sorting the plugins in a particular order */
    priority?: number;
}

/**
 * The metadata for an extension.
 * @category extensions
 * @advanced
 */
type ExtensionMetadata = ExtensionType | ExtensionMetadataDetails;

/**
 * Format when registering an extension. Generally, the extension
 * should have these values as `extension` static property,
 * but you can override name or type by providing an object.
 * @category extensions
 * @advanced
 */
interface ExtensionFormat
{
    /** The extension type, can be multiple types */
    type: ExtensionType | ExtensionType[];
    /** Optional. Some plugins provide an API name/property, such as Renderer plugins */
    name?: string;
    /** Optional, used for sorting the plugins in a particular order */
    priority?: number;
    /** Reference to the plugin object/class */
    ref: any;
}

/**
 * Extension format that is used internally for registrations.
 * @category extensions
 * @ignore
 */
interface StrictExtensionFormat extends ExtensionFormat
{
    /** The extension type, always expressed as multiple, even if a single */
    type: ExtensionType[];
}

/**
 * The function that is called when an extension is added or removed.
 * @category extensions
 * @ignore
 */
type ExtensionHandler = (extension: StrictExtensionFormat) => void;

/**
 * Convert input into extension format data.
 * @ignore
 */
const normalizeExtension = (ext: ExtensionFormat | any): StrictExtensionFormat =>
{
    // Class/Object submission, use extension object
    if (typeof ext === 'function' || (typeof ext === 'object' && ext.extension))
    {
        // #if _DEBUG
        if (!ext.extension)
        {
            throw new Error('Extension class must have an extension object');
        }
        // #endif
        const metadata: ExtensionMetadataDetails = (typeof ext.extension !== 'object')
            ? { type: ext.extension }
            : ext.extension;

        ext = { ...metadata, ref: ext };
    }
    if (typeof ext === 'object')
    {
        ext = { ...ext };
    }
    else
    {
        throw new Error('Invalid extension type');
    }

    if (typeof ext.type === 'string')
    {
        ext.type = [ext.type];
    }

    return ext;
};

/**
 * Get the priority for an extension.
 * @ignore
 * @param ext - Any extension
 * @param defaultPriority - Fallback priority if none is defined.
 * @returns The priority for the extension.
 * @category extensions
 */
export const normalizeExtensionPriority = (ext: ExtensionFormat | any, defaultPriority: number): number =>
    normalizeExtension(ext).priority ?? defaultPriority;

/**
 * Global registration system for all PixiJS extensions. Provides a centralized way to add, remove,
 * and manage functionality across the engine.
 *
 * Features:
 * - Register custom extensions and plugins
 * - Handle multiple extension types
 * - Priority-based ordering
 * @example
 * ```ts
 * import { extensions, ExtensionType } from 'pixi.js';
 *
 * // Register a simple object extension
 * extensions.add({
 *   extension: {
 *       type: ExtensionType.LoadParser,
 *       name: 'my-loader',
 *       priority: 100, // Optional priority for ordering
 *   },
 *   // add load parser functions
 * });
 *
 * // Register a class-based extension
 * class MyRendererPlugin {
 *     static extension = {
 *         type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
 *         name: 'myRendererPlugin'
 *     };
 *
 *    // add renderer plugin methods
 * }
 * extensions.add(MyRendererPlugin);
 *
 * // Remove extensions
 * extensions.remove(MyRendererPlugin);
 * ```
 * @remarks
 * - Extensions must have a type from {@link ExtensionType}
 * - Can be registered before or after their handlers
 * - Supports priority-based ordering
 * - Automatically normalizes extension formats
 * @see {@link ExtensionType} For all available extension types
 * @see {@link ExtensionFormat} For extension registration format
 * @see {@link Application} For application plugin system
 * @see {@link LoaderParser} For asset loading extensions
 * @category extensions
 * @standard
 * @class
 */
const extensions = {

    /** @ignore */
    _addHandlers: {} as Partial<Record<ExtensionType, ExtensionHandler>>,

    /** @ignore */
    _removeHandlers: {} as Partial<Record<ExtensionType, ExtensionHandler>>,

    /** @ignore */
    _queue: {} as Partial<Record<ExtensionType, StrictExtensionFormat[]>>,

    /**
     * Remove extensions from PixiJS.
     * @param extensions - Extensions to be removed. Can be:
     * - Extension class with static `extension` property
     * - Extension format object with `type` and `ref`
     * - Multiple extensions as separate arguments
     * @returns {extensions} this for chaining
     * @example
     * ```ts
     * // Remove a single extension
     * extensions.remove(MyRendererPlugin);
     *
     * // Remove multiple extensions
     * extensions.remove(
     *     MyRendererPlugin,
     *     MySystemPlugin
     * );
     * ```
     * @see {@link ExtensionType} For available extension types
     * @see {@link ExtensionFormat} For extension format details
     */
    remove(...extensions: Array<ExtensionFormat | any>)
    {
        extensions.map(normalizeExtension).forEach((ext) =>
        {
            ext.type.forEach((type) => this._removeHandlers[type]?.(ext));
        });

        return this;
    },

    /**
     * Register new extensions with PixiJS. Extensions can be registered in multiple formats:
     * - As a class with a static `extension` property
     * - As an extension format object
     * - As multiple extensions passed as separate arguments
     * @param extensions - Extensions to add to PixiJS. Each can be:
     * - A class with static `extension` property
     * - An extension format object with `type` and `ref`
     * - Multiple extensions as separate arguments
     * @returns This extensions instance for chaining
     * @example
     * ```ts
     * // Register a simple extension
     * extensions.add(MyRendererPlugin);
     *
     * // Register multiple extensions
     * extensions.add(
     *     MyRendererPlugin,
     *     MySystemPlugin,
     * });
     * ```
     * @see {@link ExtensionType} For available extension types
     * @see {@link ExtensionFormat} For extension format details
     * @see {@link extensions.remove} For removing registered extensions
     */
    add(...extensions: Array<ExtensionFormat | any>)
    {
        // Handle any extensions either passed as class w/ data or as data
        extensions.map(normalizeExtension).forEach((ext) =>
        {
            ext.type.forEach((type) =>
            {
                const handlers = this._addHandlers;
                const queue = this._queue;

                if (!handlers[type])
                {
                    queue[type] = queue[type] || [];
                    queue[type]?.push(ext);
                }
                else
                {
                    handlers[type]?.(ext);
                }
            });
        });

        return this;
    },

    /**
     * Internal method to handle extensions by name.
     * @param type - The extension type.
     * @param onAdd  - Function handler when extensions are added/registered {@link StrictExtensionFormat}.
     * @param onRemove  - Function handler when extensions are removed/unregistered {@link StrictExtensionFormat}.
     * @returns this for chaining.
     * @internal
     * @ignore
     */
    handle(type: ExtensionType, onAdd: ExtensionHandler, onRemove: ExtensionHandler)
    {
        const addHandlers = this._addHandlers;
        const removeHandlers = this._removeHandlers;

        // #if _DEBUG
        if (addHandlers[type] || removeHandlers[type])
        {
            throw new Error(`Extension type ${type} already has a handler`);
        }
        // #endif

        addHandlers[type] = onAdd;
        removeHandlers[type] = onRemove;

        // Process the queue
        const queue = this._queue;

        // Process any plugins that have been registered before the handler
        if (queue[type])
        {
            queue[type]?.forEach((ext) => onAdd(ext));
            delete queue[type];
        }

        return this;
    },

    /**
     * Handle a type, but using a map by `name` property.
     * @param type - Type of extension to handle.
     * @param map - The object map of named extensions.
     * @returns this for chaining.
     * @ignore
     */
    handleByMap(type: ExtensionType, map: Record<string, any>)
    {
        return this.handle(type,
            (extension) =>
            {
                if (extension.name)
                {
                    map[extension.name] = extension.ref;
                }
            },
            (extension) =>
            {
                if (extension.name)
                {
                    delete map[extension.name];
                }
            }
        );
    },

    /**
     * Handle a type, but using a list of extensions with a `name` property.
     * @param type - Type of extension to handle.
     * @param map - The array of named extensions.
     * @param defaultPriority - Fallback priority if none is defined.
     * @returns this for chaining.
     * @ignore
     */
    handleByNamedList(type: ExtensionType, map: {name: string, value: any}[], defaultPriority = -1)
    {
        return this.handle(
            type,
            (extension) =>
            {
                const index = map.findIndex((item) => item.name === extension.name);

                if (index >= 0) return;

                map.push({ name: extension.name, value: extension.ref });
                map.sort((a, b) =>
                    normalizeExtensionPriority(b.value, defaultPriority)
                    - normalizeExtensionPriority(a.value, defaultPriority));
            },
            (extension) =>
            {
                const index = map.findIndex((item) => item.name === extension.name);

                if (index !== -1)
                {
                    map.splice(index, 1);
                }
            }
        );
    },

    /**
     * Handle a type, but using a list of extensions.
     * @param type - Type of extension to handle.
     * @param list - The list of extensions.
     * @param defaultPriority - The default priority to use if none is specified.
     * @returns this for chaining.
     * @ignore
     */
    handleByList(type: ExtensionType, list: any[], defaultPriority = -1)
    {
        return this.handle(
            type,
            (extension) =>
            {
                if (list.includes(extension.ref))
                {
                    return;
                }

                list.push(extension.ref);
                list.sort((a, b) =>
                    normalizeExtensionPriority(b, defaultPriority) - normalizeExtensionPriority(a, defaultPriority));
            },
            (extension) =>
            {
                const index = list.indexOf(extension.ref);

                if (index !== -1)
                {
                    list.splice(index, 1);
                }
            }
        );
    },

    /**
     * Mixin the source object(s) properties into the target class's prototype.
     * Copies all property descriptors from source objects to the target's prototype.
     * @param Target - The target class to mix properties into
     * @param sources - One or more source objects containing properties to mix in
     * @example
     * ```ts
     * // Create a mixin with shared properties
     * const moveable = {
     *     x: 0,
     *     y: 0,
     *     move(x: number, y: number) {
     *         this.x += x;
     *         this.y += y;
     *     }
     * };
     *
     * // Create a mixin with computed properties
     * const scalable = {
     *     scale: 1,
     *     get scaled() {
     *         return this.scale > 1;
     *     }
     * };
     *
     * // Apply mixins to a class
     * extensions.mixin(Sprite, moveable, scalable);
     *
     * // Use mixed-in properties
     * const sprite = new Sprite();
     * sprite.move(10, 20);
     * console.log(sprite.x, sprite.y); // 10, 20
     * ```
     * @remarks
     * - Copies all properties including getters/setters
     * - Does not modify source objects
     * - Preserves property descriptors
     * @see {@link Object.defineProperties} For details on property descriptors
     * @see {@link Object.getOwnPropertyDescriptors} For details on property copying
     */
    mixin(Target: any, ...sources: Parameters<typeof Object.getOwnPropertyDescriptors>[0][])
    {
        // Apply each source's properties to the target prototype
        for (const source of sources)
        {
            Object.defineProperties(Target.prototype, Object.getOwnPropertyDescriptors(source));
        }
    }
};

export {
    extensions,
    ExtensionType,
};
export type {
    StrictExtensionFormat as ExtensionFormat,
    ExtensionFormat as ExtensionFormatLoose,
    ExtensionHandler,
    ExtensionMetadata,
    ExtensionMetadataDetails
};
