import { ExtensionType } from '../../../extensions/Extensions';
import { compileHighShaderGlProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBitGl } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { textureBitGl } from '../../../rendering/high-shader/shader-bits/textureBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { warn } from '../../../utils/logging/warn';

import type { Mesh } from '../shared/Mesh';
import type { MeshAdaptor, MeshPipe } from '../shared/MeshPipe';

/**
 * A MeshAdaptor that uses the WebGL to render meshes.
 * @memberof rendering
 */
export class GlMeshAdaptor implements MeshAdaptor
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'mesh',
    } as const;

    private _shader: Shader;

    public init(): void
    {
        const glProgram = compileHighShaderGlProgram({
            name: 'mesh',
            bits: [
                localUniformBitGl,
                textureBitGl,
                roundPixelsBitGl,
            ]
        });

        this._shader = new Shader({
            glProgram,
            resources: {
                uTexture: Texture.EMPTY.source,
            }
        });
    }

    public execute(meshPipe: MeshPipe, mesh: Mesh): void
    {
        const renderer = meshPipe.renderer;

        let shader: Shader = mesh._shader;

        if (!shader)
        {
            shader = this._shader;

            const source = mesh.texture.source;

            shader.resources.uTexture = source;
            shader.resources.uSampler = source.style;
        }
        else if (!shader.glProgram)
        {
            // #if _DEBUG
            warn('Mesh shader has no glProgram', mesh.shader);
            // #endif

            return;
        }

        shader.groups[0] = renderer.globalUniforms.bindGroup;
        shader.groups[1] = meshPipe.localUniformsBindGroup;

        renderer.encoder.draw({
            geometry: mesh._geometry,
            shader,
            state: mesh.state,
        });
    }

    public destroy(): void
    {
        this._shader.destroy(true);
        this._shader = null;
    }
}
