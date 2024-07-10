import { ExtensionType } from '../../../extensions/Extensions';
import { compileHighShaderGpuProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { localUniformBit } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBit } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { textureBit } from '../../../rendering/high-shader/shader-bits/textureBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { warn } from '../../../utils/logging/warn';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Mesh } from '../shared/Mesh';
import type { MeshAdaptor, MeshPipe } from '../shared/MeshPipe';

/**
 * The WebGL adaptor for the mesh system. Allows the Mesh System to be used with the WebGl renderer
 * @memberof rendering
 * @ignore
 */
export class GpuMeshAdapter implements MeshAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'mesh',
    } as const;

    private _shader: Shader;

    public init(): void
    {
        const gpuProgram = compileHighShaderGpuProgram({
            name: 'mesh',
            bits: [
                localUniformBit,
                textureBit,
                roundPixelsBit,
            ]
        });

        this._shader = new Shader({ gpuProgram });
    }

    public execute(meshPipe: MeshPipe, mesh: Mesh)
    {
        const renderer = meshPipe.renderer;

        let shader: Shader = mesh._shader;

        if (!shader)
        {
            shader = this._shader;
        }
        else if (!shader.gpuProgram)
        {
            // #if _DEBUG
            warn('Mesh shader has no gpuProgram', mesh.shader);
            // #endif

            return;
        }

        const gpuProgram = shader.gpuProgram;
        // GPU..

        if (gpuProgram.autoAssignGlobalUniforms)
        {
            shader.groups[0] = renderer.globalUniforms.bindGroup;
        }

        if (gpuProgram.autoAssignLocalUniforms)
        {
            const localUniforms = meshPipe.localUniforms;

            shader.groups[1] = (renderer as WebGPURenderer)
                .renderPipes.uniformBatch.getUniformBindGroup(localUniforms, true);
        }

        if (gpuProgram.layout[2]?.textureUniforms !== undefined)
        {
            const textureUniforms = meshPipe.textureUniforms;
            const uniforms = textureUniforms.uniforms;
            const texture = mesh.texture;
            const textureMatrix = texture.textureMatrix;

            uniforms.uTextureMatrix = textureMatrix.mapCoord;
            uniforms.uClampFrame = textureMatrix.uClampFrame;
            uniforms.uClampOffset = textureMatrix.uClampOffset;

            const source = texture._source;
            const bindGroup = meshPipe.textureUniformsBindGroup;

            bindGroup.setResource(source, 0);
            bindGroup.setResource(source.style, 1);
            bindGroup.setResource((renderer as WebGPURenderer).renderPipes.uniformBatch.getUboResource(textureUniforms), 2);

            shader.groups[2] = bindGroup;
        }

        renderer.encoder.draw({
            geometry: mesh._geometry,
            shader,
            state: mesh.state
        });
    }

    public destroy(): void
    {
        this._shader.destroy(true);
        this._shader = null;
    }
}
