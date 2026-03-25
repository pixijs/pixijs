import { serializeContainer, serializeContainerAsync } from '../serializers/serializeContainer';

import type { Container } from '../../scene/container/Container';
import type { Gl2dRef } from '../Gl2dSchema';
import type { Gl2dSerializeAsyncContext, Gl2dSerializeContext } from '../serializeContext';

/**
 * Interface added to Container (and subclasses) by the gl2d mixin.
 * @category gl2d
 * @standard
 */
export interface Gl2dSerializeMixin
{
    /** Sync-serialize this display object into the gl2d context. */
    toGl2d(ctx: Gl2dSerializeContext): Gl2dRef;
    /** Async-serialize this display object into the gl2d context. */
    toGl2dAsync(ctx: Gl2dSerializeAsyncContext): Promise<Gl2dRef>;
}

/** @internal */
export const serializeContainerMixin: Partial<Container> = {
    toGl2d(this: Container, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeContainer(this, ctx);
    },
    toGl2dAsync(this: Container, ctx: Gl2dSerializeAsyncContext): Promise<Gl2dRef>
    {
        return serializeContainerAsync(this, ctx);
    },
} as Partial<Container>;
