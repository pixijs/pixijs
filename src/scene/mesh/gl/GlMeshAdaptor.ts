import { ExtensionType } from '../../../extensions/Extensions';
import { compileHighShaderGlProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { textureBitGl } from '../../../rendering/high-shader/shader-bits/textureBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';

import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { MeshAdaptor, MeshPipe } from '../shared/MeshPipe';
import type { MeshView } from '../shared/MeshView';

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
            ]
        });

        this._shader = new Shader({
            glProgram,
            resources: {
                uTexture: Texture.EMPTY.source,
            }
        });

        // will be added later in the shader so declare them here:
        this._shader.addResource('globalUniforms', 0, 0);
        this._shader.addResource('localUniforms', 1, 0);
    }

    public execute(meshPipe: MeshPipe, renderable: Renderable<MeshView>): void
    {
        const renderer = meshPipe.renderer;
        const view = renderable.view;

        const state = view.state;

        state.blendMode = renderable.layerBlendMode;

        const localUniforms = meshPipe.localUniforms;

        localUniforms.uniforms.uTransformMatrix = renderable.layerTransform;
        localUniforms.update();

        color32BitToUniform(
            renderable.layerColor,
            localUniforms.uniforms.uColor,
            0
        );

        let shader: Shader = view._shader;

        if (!shader)
        {
            shader = this._shader;

            const source = view.texture.source;

            shader.resources.uTexture = source;
            shader.resources.uSampler = source.style;
        }

        shader.groups[0] = renderer.globalUniforms.bindGroup;
        shader.groups[1] = meshPipe.localUniformsBindGroup;

        renderer.encoder.draw({
            geometry: view._geometry,
            shader,
            state
        });
    }

    public destroy(): void
    {
        this._shader.destroy(true);
        this._shader = null;
    }
}
