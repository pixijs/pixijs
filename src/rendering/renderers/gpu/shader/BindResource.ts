import type { Runner } from '../../shared/runner/Runner';

/** an interface that allows a resource to be bound to the gpu in a bind group */
export interface BindResource
{
    /** The type of resource this is */
    resourceType: string;

    /** Unique id for this resource this can change and is used to link the gpu*/
    resourceId: number;

    /**
     * dispatch whenever the underlying resource needs to change
     * this could be a texture or buffer that has been resized.
     * This is important as it allows the renderer to know that it needs to rebind the resource
     */
    onResourceChange?: Runner;
}
