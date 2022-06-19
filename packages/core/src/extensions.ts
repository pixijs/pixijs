enum ExtensionType
// eslint-disable-next-line @typescript-eslint/indent
{
    Application = 'application',
    RendererPlugin = 'renderer-webgl-plugin',
    CanvasRendererPlugin = 'renderer-canvas-plugin',
    Loader = 'loader',
}

interface ExtensionClass
{
    new (): any;
    extension: ExtensionMetadata;
}

interface ExtensionMetadataDetails
{
    type: ExtensionType | ExtensionType[];
    name?: string;
}

type ExtensionMetadata = ExtensionType | ExtensionMetadataDetails;

interface ExtensionFormatLoose
{
    type: ExtensionType | ExtensionType[];
    name?: string;
    ref: ExtensionClass;
}

interface ExtensionFormat
{
    type: ExtensionType[];
    name?: string;
    ref: ExtensionClass;
}

type ExtensionHandler = (extension: ExtensionFormat) => void;

/**
 * Convert input into extension format data.
 * @ignore
 */
const normalizeExtension = (ext: ExtensionClass | ExtensionFormatLoose | any): ExtensionFormat =>
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
 * @namespace PIXI.extensions
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
    remove(...extensions: Array<ExtensionFormatLoose | ExtensionClass | any>)
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
    add(...extensions: Array<ExtensionFormatLoose | ExtensionClass | any>)
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
     * @param onAdd - Function for handling extensions.
     * @param onRemove
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
    ExtensionFormat,
    ExtensionClass,
};
