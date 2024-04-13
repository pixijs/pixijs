import type { BindGroup } from './BindGroup';

/**
 * an interface that allows a resource to be bound to the gpu in a bind group
 * @memberof rendering
 */
export interface BindResource
{
    /**
     * The type of resource this is
     * @ignore
     */
    _resourceType: string;

    /**
     * Unique id for this resource this can change and is used to link the gpu
     * @ignore
     */
    _resourceId: number;

    _touched: number;

    /**
     * a boolean that indicates if the resource has been destroyed.
     * If true, the resource should not be used and any bind groups
     * that will release any references to this resource.
     * @ignore
     */
    destroyed: boolean;

    /**
     * event dispatch whenever the underlying resource needs to change
     * this could be a texture or buffer that has been resized.
     * This is important as it allows the renderer to know that it needs to rebind the resource
     */
    on?(event: 'change', listenerFunction: (resource: BindResource) => void, listener: BindGroup): void
    /** @todo */
    off?(event: 'change', listenerFunction: (resource: BindResource) => void, listener: BindGroup): void
}
