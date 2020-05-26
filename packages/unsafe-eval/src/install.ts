import { syncUniforms } from './syncUniforms';

import type { Program, UniformGroup } from '@pixi/core';

export function install(PIXI: any): void
{
    if (!PIXI || !PIXI.systems || !PIXI.systems.ShaderSystem)
    {
        throw new Error('Unable to patch ShaderSystem, class not found.');
    }

    const { ShaderSystem } = PIXI.systems;
    let proceed = false;

    // Do a quick check to see if the patch is needed
    // want to make sure we only apply if necessary!
    try
    {
        ShaderSystem.prototype.systemCheck.call(null);
        proceed = false;
    }
    catch (err)
    {
        proceed = true;
    }

    // Only apply if needed
    if (proceed)
    {
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
}
