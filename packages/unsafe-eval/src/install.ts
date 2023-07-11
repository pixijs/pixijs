import { ShaderSystem, utils } from '@pixi/core';
import { syncUniforms } from './syncUniforms';

import type { Program, UniformGroup } from '@pixi/core';

interface PIXICore
{
    ShaderSystem: typeof ShaderSystem;
}

/**
 * Apply the no `new Function` patch to ShaderSystem in `@pixi/core`.
 * `@pixi/unsafe-eval` is self-installed since 7.1.0, so this function no longer needs to be called manually.
 * @param _core
 * @deprecated since 7.1.0
 */
export function install(_core: PIXICore): void
{
    if (process.env.DEBUG)
    {
        utils.deprecation('7.1.0', 'install() has been deprecated, @pixi/unsafe-eval is self-installed since 7.1.0');
    }
}

/**
 * Apply the no `new Function` patch to ShaderSystem in `@pixi/core`.
 * @private
 * @since 7.1.0
 */
function selfInstall(): void
{
    Object.assign(ShaderSystem.prototype,
        {
            systemCheck()
            {
                // Do nothing, don't throw error
            },
            syncUniforms(group: UniformGroup, glProgram: Program)
            {
                const { shader, renderer } = (this as any);

                syncUniforms(
                    group,
                    shader.program.uniformData,
                    glProgram.uniformData,
                    group.uniforms,
                    renderer
                );
            },
        }
    );
}

selfInstall();
