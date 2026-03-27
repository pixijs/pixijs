import { type Gl2dRef } from '../types/Gl2dTypes';

import type { Gl2dSerializeContext } from '../serializeContext';

/**
 * Interface added to serializable objects by gl2d mixins.
 * @category gl2d
 * @standard
 */
export interface Gl2dSerializeMixin
{
    /** Sync-serialize this object into the gl2d context. */
    toGl2d(ctx: Gl2dSerializeContext): Gl2dRef;
}
