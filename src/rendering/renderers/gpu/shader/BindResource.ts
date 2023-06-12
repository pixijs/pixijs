import type { BindGroup } from './BindGroup';

/** an interface that allows a resource to be bound to the gpu in a bind group */
export interface BindResource
{
    /** The type of resource this is */
    resourceType: string;

    /** Unique id for this resource this can change and is used to link the gpu*/
    resourceId: number;

    /**
     * event dispatch whenever the underlying resource needs to change
     * this could be a texture or buffer that has been resized.
     * This is important as it allows the renderer to know that it needs to rebind the resource
     */
    on?(event: 'change', listenerFunction: (resource: BindResource) => void, listener: BindGroup): void
    off?(event: 'change', listenerFunction: (resource: BindResource) => void, listener: BindGroup): void

}
