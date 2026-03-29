import { serializeBufferImageSource } from '../serializers/resources/textures/serializeBufferImageSource';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { BufferImageSource } from '../../rendering/renderers/shared/texture/sources/BufferImageSource';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeBufferImageSourceMixin: Partial<BufferImageSource> = {
    toGl2d(this: BufferImageSource, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeBufferImageSource(this, ctx);
    },
} as Partial<BufferImageSource>;
