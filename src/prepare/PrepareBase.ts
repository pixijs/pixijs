import { Container } from '../scene/container/Container';
import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';

import type { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../rendering/renderers/types';
import type { GraphicsContext } from '../scene/graphics/shared/GraphicsContext';
import type { Text } from '../scene/text/Text';

/** The accepted types to pass to the prepare system */
export type PrepareSourceItem = Container | TextureSource | Texture | GraphicsContext;

/** The valid types resolved to the queue ready for upload */
export type PrepareQueueItem = TextureSource | Text | GraphicsContext;

/**
 * Part of the prepare system. Responsible for uploading all the items to the GPU.
 * This class provides the base functionality and handles processing the queue asynchronously.
 * @memberof rendering
 */
export abstract class PrepareBase
{
    /** The number of uploads to process per frame */
    public static uploadsPerFrame = 4;

    /** Reference to the renderer */
    protected renderer: Renderer;

    /** The queue to process over a async timer */
    protected queue: PrepareQueueItem[];

    /** Collection of callbacks to call when the uploads are finished */
    protected resolves: ((value: void | PromiseLike<void>) => void)[];

    /** Timeout id for next processing call */
    protected timeout?: number;

    /**
     * @param {rendering.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        this.queue = [];
        this.resolves = [];
    }

    /** Resolve the given resource type and return an item for the queue */
    protected abstract resolveQueueItem(source: PrepareSourceItem, queue: PrepareQueueItem[]): void;
    protected abstract uploadQueueItem(item: PrepareQueueItem): void;

    /**
     * Return a copy of the queue
     * @returns {PrepareQueueItem[]} The queue
     */
    public getQueue(): PrepareQueueItem[]
    {
        return [...this.queue];
    }

    /**
     * Add a textures or graphics resource to the queue
     * @param {PrepareSourceItem | PrepareSourceItem[]} resource
     */
    public add(resource: PrepareSourceItem | PrepareSourceItem[]): this
    {
        const resourceArray = Array.isArray(resource) ? resource : [resource];

        for (const resourceItem of resourceArray)
        {
            // handle containers and their children
            if (resourceItem instanceof Container)
            {
                this._addContainer(resourceItem);
            }
            else
            {
                this.resolveQueueItem(resourceItem, this.queue);
            }
        }

        return this;
    }

    /**
     * Recursively add a container and its children to the queue
     * @param {Container} container - The container to add to the queue
     */
    private _addContainer(container: Container): void
    {
        this.resolveQueueItem(container, this.queue);

        // recursively add children
        for (const child of container.children)
        {
            this._addContainer(child);
        }
    }

    /**
     * Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
     * @param {PrepareSourceItem | PrepareSourceItem[] | undefined} resource
     */
    public upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>
    {
        if (resource)
        {
            this.add(resource);
        }

        return new Promise((resolve) =>
        {
            if (this.queue.length)
            {
                // add resolve callback to the collection
                this.resolves.push(resolve);

                // eliminate duplicates first
                this.dedupeQueue();

                // launch first tick
                Ticker.system.addOnce(this._tick, this, UPDATE_PRIORITY.UTILITY);
            }
            else
            {
                // queue is empty, resolve immediately
                resolve();
            }
        });
    }

    /** eliminate duplicates before processing */
    public dedupeQueue(): void
    {
        const hash = Object.create(null);
        let nextUnique = 0;

        for (let i = 0; i < this.queue.length; i++)
        {
            const current = this.queue[i];

            if (!hash[current.uid])
            {
                hash[current.uid] = true;
                this.queue[nextUnique++] = current;
            }
        }

        this.queue.length = nextUnique;
    }

    /** called per frame by the ticker, defer processing to next tick */
    private readonly _tick = () =>
    {
        this.timeout = setTimeout(this._processQueue, 0) as unknown as number;
    };

    /** process the queue up to max item limit per frame */
    private readonly _processQueue = () =>
    {
        const { queue } = this;
        let itemsProcessed = 0;

        // process the maximum number of items per frame
        while (queue.length && itemsProcessed < PrepareBase.uploadsPerFrame)
        {
            const queueItem = queue.shift();

            this.uploadQueueItem(queueItem);

            itemsProcessed++;
        }

        if (queue.length)
        {
            // queue is not empty, continue processing on next frame
            Ticker.system.addOnce(this._tick, this, UPDATE_PRIORITY.UTILITY);
        }
        else
        {
            // queue is empty, resolve immediately
            this._resolve();
        }
    };

    /** Call all the resolve callbacks */
    private _resolve(): void
    {
        const { resolves } = this;

        // call all resolve callbacks
        const array = resolves.slice(0);

        resolves.length = 0;

        for (const resolve of array)
        {
            resolve();
        }
    }
}
