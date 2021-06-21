import { syncUniforms } from './syncUniforms';

import type { ShaderSystem, Program, UniformGroup } from '@pixi/core';

interface PIXICore {
    ShaderSystem: typeof ShaderSystem;
}

export function install({ ShaderSystem }: PIXICore): void
{
    if (!ShaderSystem)
    {
        throw new Error('Unable to patch ShaderSystem, class not found.');
    }

    Object.assign(ShaderSystem.prototype,
        {
            systemCheck()
            {
            // do nothing, don't throw error
            },
            syncUniforms(group: UniformGroup, glProgram: Program)
            {
                const { shader, renderer } = (this as any);

                /* eslint-disable max-len */
                syncUniforms(
                    group,
                    shader.program.uniformData,
                    glProgram.uniformData,
                    group.uniforms,
                    renderer
                );
            /* eslint-disable max-len */
            },
        }
    );
}
