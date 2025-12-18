import { type GCable, type GCData } from '../../rendering/renderers/shared/GCSystem';
import { type Renderer } from '../../rendering/renderers/types';

import type EventEmitter from 'eventemitter3';

/**
 * Options for the {@link GCManagedHash}.
 * @internal
 */
export interface GCManagedHashOptions<T extends GCable & { uid: number } & Pick<EventEmitter, 'once' | 'off'>>
{
    renderer: Renderer;
    type: GCData['type'];
    onUnload?: (item: T, ...args: any[]) => void;
    priority?: number;
}

/**
 * A hash for managing renderable and resource resources with GC integration.
 * @internal
 */
export class GCManagedHash<T extends GCable & { uid: number } & Pick<EventEmitter, 'once' | 'off'>>
{
    // Exposed directly for GC system access
    public items: Record<number, T> = Object.create(null);
    private _renderer: Renderer;
    private _onUnload?: (item: T, ...args: unknown[]) => void;

    constructor(options: GCManagedHashOptions<T>)
    {
        const { renderer, type, onUnload, priority } = options;

        this._renderer = renderer;
        renderer.gc.addResourceHash(this, 'items', type, priority ?? 0);
        this._onUnload = onUnload;
    }

    /**
     * Add an item to the hash. No-op if already added.
     * @param item
     * @returns true if the item was added, false if it was already in the hash
     */
    public add(item: T): boolean
    {
        if (this.items[item.uid]) return false;
        this.items[item.uid] = item;
        item.once('unload', this.remove, this);
        item._gcLastUsed = this._renderer.gc.now;

        return true;
    }

    public remove(item: T, ...args: unknown[]): void
    {
        if (!this.items[item.uid]) return;

        const gpuData = item._gpuData[this._renderer.uid];

        if (!gpuData) return;

        this._onUnload?.(item, ...args);

        gpuData.destroy();
        item._gpuData[this._renderer.uid] = null;
        this.items[item.uid] = null;
    }

    public removeAll(...args: unknown[]): void
    {
        Object.values(this.items).forEach((item) => item && this.remove(item, ...args));
    }

    public destroy(...args: unknown[]): void
    {
        this.removeAll(...args);
        this.items = Object.create(null);
        this._renderer = null;
        this._onUnload = null;
    }
}
