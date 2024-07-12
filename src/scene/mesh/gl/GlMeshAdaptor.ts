import { ExtensionType } from '../../../extensions/Extensions';
import { compileHighShaderGlProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBitGl } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { textureBitGl } from '../../../rendering/high-shader/shader-bits/textureBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { warn } from '../../../utils/logging/warn';

import type { Mesh } from '../shared/Mesh';
import type { MeshAdaptor, MeshPipe } from '../shared/MeshPipe';

/**
 * A MeshAdaptor that uses the WebGL to render meshes.
 * @memberof rendering
 * @ignore
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

        this._shader = new Shader({ glProgram });
    }

    public execute(meshPipe: MeshPipe, mesh: Mesh): void
    {
        const renderer = meshPipe.renderer;

        let shader: Shader = mesh._shader;

        if (!shader)
        {
            shader = this._shader;
        }
        else if (!shader.glProgram)
        {
            // #if _DEBUG
            warn('Mesh shader has no glProgram', mesh.shader);
            // #endif

            return;
        }

        const texture = mesh.texture;
        const source = texture._source;

        meshPipe.textureUniformsBindGroup.setResource(source, 0);
        meshPipe.textureUniformsBindGroup.setResource(source.style, 1);

        const textureMatrix = texture.textureMatrix;
        const textureUniforms = meshPipe.textureUniforms.uniforms;

        textureUniforms.uTextureMatrix = textureMatrix.mapCoord;
        textureUniforms.uClampFrame = textureMatrix.uClampFrame;
        textureUniforms.uClampOffset = textureMatrix.uClampOffset;

        // setting the groups to be high to be compatible and not
        // overlap any other groups
        shader.groups[100] = renderer.globalUniforms.bindGroup;
        shader.groups[101] = meshPipe.localUniformsBindGroup;
        shader.groups[102] = meshPipe.textureUniformsBindGroup;
        shader._uniformBindMap[102] = meshPipe.textureUniformsBindMap;

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
