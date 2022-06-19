/**
 * Collection of valid extension types.
 * @memberof PIXI
 * @property {string} Application - Application plugins
 * @property {string} RendererPlugin - Plugins for Renderer
 * @property {string} CanvasRendererPlugin - Plugins for CanvasRenderer
 * @property {string} Loader - Plugins to use with Loader
 */
enum ExtensionType
// eslint-disable-next-line @typescript-eslint/indent
{
    Application = 'application',
    RendererPlugin = 'renderer-webgl-plugin',
    CanvasRendererPlugin = 'renderer-canvas-plugin',
    Loader = 'loader',
}

interface ExtensionMetadataDetails
{
    type: ExtensionType | ExtensionType[];
    name?: string;
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
    // Class submission, use extension object
    if (typeof ext === 'function')
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
 * Global registration of all PixiJS extensions. One-stop-shop for extensibility.
 * @memberof PIXI
 * @namespace extensions
 */
const extensions = {

    /** @ignore */
    _addHandlers: null as Record<ExtensionType, ExtensionHandler>,

    /** @ignore */
    _removeHandlers: null as Record<ExtensionType, ExtensionHandler>,

    /** @ignore */
    _queue: {} as Record<ExtensionType, ExtensionFormat[]>,

    /**
     * Remove extensions from PixiJS.
     * @param extensions - Extensions to be removed.
     */
    remove(...extensions: Array<ExtensionFormatLoose | any>)
    {
        extensions.map(normalizeExtension).forEach((ext) =>
        {
            ext.type.forEach((type) => this._removeHandlers[type]?.(ext));
        });
    },

    /**
     * Register new extensions with PixiJS.
     * @param extensions - The spread of extensions to add to PixiJS.
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
    },

    /**
     * Internal method to handle extensions by name.
     * @param type - The extension type.
     * @param onAdd  - Function for handling when extensions are added/registered passes {@link PIXI.ExtensionFormat}.
     * @param onRemove  - Function for handling when extensions are removed/unregistered passes {@link PIXI.ExtensionFormat}.
     */
    handle(type: ExtensionType, onAdd: ExtensionHandler, onRemove: ExtensionHandler)
    {
        const addHandlers = this._addHandlers = this._addHandlers || {} as Record<ExtensionType, ExtensionHandler>;
        const removeHandlers = this._removeHandlers = this._removeHandlers || {} as Record<ExtensionType, ExtensionHandler>;

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
            queue[type].forEach((ext) => onAdd(ext));
            delete queue[type];
        }
    },
};

export {
    extensions,
    ExtensionType,
};
export type {
    ExtensionHandler,
    ExtensionMetadata,
    ExtensionFormatLoose,
    ExtensionFormat,
};
