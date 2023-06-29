import { ExtensionType } from '../../../extensions/Extensions';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';

import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { MeshAdaptor, MeshPipe } from '../shared/MeshPipe';
import type { MeshView } from '../shared/MeshView';

export class GpuMeshAdapter implements MeshAdaptor
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPURendererPipesAdaptor,
        ],
        name: 'mesh',
    } as const;

    execute(meshPipe: MeshPipe, renderable: Renderable<MeshView>)
    {
        const renderer = meshPipe.renderer;
        const view = renderable.view;

        const state = meshPipe.state;

        state.blendMode = renderable.layerBlendMode;

        const localUniforms = meshPipe.localUniforms;

        localUniforms.uniforms.transformMatrix = renderable.layerTransform;
        localUniforms.update();

        color32BitToUniform(
            renderable.layerColor,
            localUniforms.uniforms.color,
            0
        );

        let shader = view._shader;

        if (!shader)
        {
            shader = meshPipe.meshShader;

            shader.groups[2] = (renderer as WebGPURenderer)
                .texture.getTextureBindGroup(view.texture);
        }

        // GPU..
        shader.groups[0] = renderer.globalUniforms.bindGroup;

        shader.groups[1] = (renderer as WebGPURenderer)
            .renderPipes.uniformBatch.getUniformBindGroup(localUniforms, true);

        renderer.encoder.draw({
            geometry: view._geometry,
            shader,
            state
        });
    }
}
