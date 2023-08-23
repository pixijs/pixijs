/**
 * Collection of valid extension types.
 * @memberof PIXI
 * @property {string} Application - Application plugins
 * @property {string} RendererPlugin - Plugins for Renderer
 * @property {string} CanvasRendererPlugin - Plugins for CanvasRenderer
 * @property {string} Loader - Plugins to use with Loader
 * @property {string} LoadParser - Parsers for Assets loader.
 * @property {string} ResolveParser - Parsers for Assets resolvers.
 * @property {string} CacheParser - Parsers for Assets cache.
 */
enum ExtensionType
// eslint-disable-next-line @typescript-eslint/indent
{
    Renderer = 'renderer',
    Application = 'application',
    RendererSystem = 'renderer-webgl-system',
    RendererPlugin = 'renderer-webgl-plugin',
    CanvasRendererSystem = 'renderer-canvas-system',
    CanvasRendererPlugin = 'renderer-canvas-plugin',
    Asset = 'asset',
    LoadParser = 'load-parser',
    ResolveParser = 'resolve-parser',
    CacheParser = 'cache-parser',
    DetectionParser = 'detection-parser',
}

interface ExtensionMetadataDetails
{
    type: ExtensionType | ExtensionType[];
    name?: string;
    priority?: number;
}

type ExtensionMetadata = ExtensionType | ExtensionMetadataDetails;

/**
 * Format when registering an extension. Generally, the extension
 * should have these values as `extension` static property,
 * but you can override name or type by providing an object.
 * @memberof PIXI
 */
interface ExtensionFormatLoose
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
 * Strict extension format that is used internally for registrations.
 * @memberof PIXI
 */
interface ExtensionFormat extends ExtensionFormatLoose
{
    /** The extension type, always expressed as multiple, even if a single */
    type: ExtensionType[];
}

type ExtensionHandler = (extension: ExtensionFormat) => void;

/**
 * Convert input into extension format data.
 * @ignore
 */
const normalizeExtension = (ext: ExtensionFormatLoose | any): ExtensionFormat =>
{
    // Class/Object submission, use extension object
    if (typeof ext === 'function' || (typeof ext === 'object' && ext.extension))
    {
        if (process.env.DEBUG)
        {
            if (!ext.extension)
            {
                throw new Error('Extension class must have an extension object');
            }
        }
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
 */
const normalizePriority = (ext: ExtensionFormatLoose | any, defaultPriority: number): number =>
    normalizeExtension(ext).priority ?? defaultPriority;

/**
 * Global registration of all PixiJS extensions. One-stop-shop for extensibility.
 * @memberof PIXI
 * @namespace extensions
 */
const extensions = {

    /** @ignore */
    _addHandlers: {} as Record<ExtensionType, ExtensionHandler>,

    /** @ignore */
    _removeHandlers: {} as Record<ExtensionType, ExtensionHandler>,

    /** @ignore */
    _queue: {} as Record<ExtensionType, ExtensionFormat[]>,

    /**
     * Remove extensions from PixiJS.
     * @param extensions - Extensions to be removed.
     * @returns {PIXI.extensions} For chaining.
     */
    remove(...extensions: Array<ExtensionFormatLoose | any>)
    {
        extensions.map(normalizeExtension).forEach((ext) =>
        {
            ext.type.forEach((type) => this._removeHandlers[type]?.(ext));
        });

        return this;
    },

    /**
     * Register new extensions with PixiJS.
     * @param extensions - The spread of extensions to add to PixiJS.
     * @returns {PIXI.extensions} For chaining.
     */
    add(...extensions: Array<ExtensionFormatLoose | any>)
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
                    queue[type].push(ext);
                }
                else
                {
                    handlers[type](ext);
                }
            });
        });

        return this;
    },

    /**
     * Internal method to handle extensions by name.
     * @param type - The extension type.
     * @param onAdd  - Function for handling when extensions are added/registered passes {@link PIXI.ExtensionFormat}.
     * @param onRemove  - Function for handling when extensions are removed/unregistered passes {@link PIXI.ExtensionFormat}.
     * @returns {PIXI.extensions} For chaining.
     */
    handle(type: ExtensionType, onAdd: ExtensionHandler, onRemove: ExtensionHandler)
    {
        const addHandlers = this._addHandlers;
        const removeHandlers = this._removeHandlers;

        if (process.env.DEBUG)
        {
            if (addHandlers[type] || removeHandlers[type])
            {
                throw new Error(`Extension type ${type} already has a handler`);
            }
        }

        addHandlers[type] = onAdd;
        removeHandlers[type] = onRemove;

        // Process the queue
        const queue = this._queue;

        // Process any plugins that have been registered before the handler
        if (queue[type])
        {
            queue[type].forEach((ext) => onAdd(ext));
            delete queue[type];
        }

        return this;
    },

    /**
     * Handle a type, but using a map by `name` property.
     * @param type - Type of extension to handle.
     * @param map - The object map of named extensions.
     * @returns {PIXI.extensions} For chaining.
     */
    handleByMap(type: ExtensionType, map: Record<string, any>)
    {
        return this.handle(type,
            (extension) =>
            {
                map[extension.name] = extension.ref;
            },
            (extension) =>
            {
                delete map[extension.name];
            }
        );
    },

    /**
     * Handle a type, but using a list of extensions.
     * @param type - Type of extension to handle.
     * @param list - The list of extensions.
     * @param defaultPriority - The default priority to use if none is specified.
     * @returns {PIXI.extensions} For chaining.
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
                list.sort((a, b) => normalizePriority(b, defaultPriority) - normalizePriority(a, defaultPriority));
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
};

export {
    extensions,
    ExtensionType,
};
export type {
    ExtensionFormat,
    ExtensionFormatLoose,
    ExtensionHandler,
    ExtensionMetadata,
};
