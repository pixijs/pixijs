import { ExtensionType } from '../../../extensions/Extensions';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';
import { GlProgram } from '../../renderers/gl/shader/GlProgram';
import { Shader } from '../../renderers/shared/shader/Shader';
import { Texture } from '../../renderers/shared/texture/Texture';
import programFrag from '../gl/mesh-default.frag';
import programVert from '../gl/mesh-default.vert';

import type { Renderable } from '../../renderers/shared/Renderable';
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
        const glProgram = GlProgram.from({
            vertex: programVert,
            fragment: programFrag,
            name: 'mesh-default',
        });

        this._shader = new Shader({
            glProgram,
            resources: {
                uTexture: Texture.EMPTY.source,
                uSampler: Texture.EMPTY.style,
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

        localUniforms.uniforms.transformMatrix = renderable.layerTransform;
        localUniforms.update();

        color32BitToUniform(
            renderable.layerColor,
            localUniforms.uniforms.color,
            0
        );

        let shader: Shader = view._shader;

        if (!shader)
        {
            shader = this._shader;

            shader.resources.uTexture = view.texture.source;
            shader.resources.uSampler = view.texture.style;
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
