import type { UniformsSyncCallback } from '../rendering/';
import type { GlUniformData } from '../rendering/renderers/gl/shader/GlProgram';
import type { UniformGroup } from '../rendering/renderers/shared/shader/UniformGroup';

export function generateUniformsSyncPolyfill(
    _group: UniformGroup,
    _uniformData: Record<string, GlUniformData>
): UniformsSyncCallback
{
    return () =>
    {
        // Do nothing, don't throw error
    };
}

