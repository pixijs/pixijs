import { serializeVideoSource } from '../serializers/resources/textures/serializeVideoSource';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { VideoSource } from '../../rendering/renderers/shared/texture/sources/VideoSource';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeVideoSourceMixin: Partial<VideoSource> = {
    toGl2d(this: VideoSource, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeVideoSource(this, ctx);
    },
} as Partial<VideoSource>;
