import { ExtensionType } from '../../../extensions/Extensions';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';

import type { Renderable } from '../../renderers/shared/Renderable';
import type { MeshAdaptor, MeshPipe } from '../shared/MeshPipe';
import type { MeshView } from '../shared/MeshView';

export class GlMeshAdaptor implements MeshAdaptor
{
    static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'mesh',
    } as const;

    execute(meshPipe: MeshPipe, renderable: Renderable<MeshView>): void
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
            shader.texture = view.texture;
        }

        // GPU..
        shader.groups[0] = renderer.globalUniforms.bindGroup;

        shader.groups[1] = meshPipe.localUniformsBindGroup;

        renderer.encoder.draw({
            geometry: view._geometry,
            shader,
            state
        });
    }
}
