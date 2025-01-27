import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';

import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { Shader } from '../../renderers/shared/shader/Shader';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';

/**
 * A BatcherAdaptor that uses WebGL to render batches.
 * @memberof rendering
 * @ignore
 */
export class GlBatchAdaptor implements BatcherAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'batch',
    } as const;

    private readonly _tempState = State.for2d();

    /**
     * We only want to sync the a batched shaders uniforms once on first use
     * this is a hash of shader uids to a boolean value.  When the shader is first bound
     * we set the value to true.  When the shader is bound again we check the value and
     * if it is true we know that the uniforms have already been synced and we skip it.
     */
    private _didUploadHash: Record<string, boolean> = {};
    public init(batcherPipe: BatcherPipe): void
    {
        batcherPipe.renderer.runners.contextChange.add(this);
    }

    public contextChange(): void
    {
        this._didUploadHash = {};
    }

    public start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void
    {
        const renderer = batchPipe.renderer as WebGLRenderer;

        const didUpload = this._didUploadHash[shader.uid];

        // only want to sync the shade ron its first bind!
        renderer.shader.bind(shader, didUpload);

        if (!didUpload)
        {
            this._didUploadHash[shader.uid] = true;
        }

        renderer.shader.updateUniformGroup(renderer.globalUniforms.uniformGroup);

        renderer.geometry.bind(geometry, shader.glProgram);
    }

    public execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        const renderer = batchPipe.renderer as WebGLRenderer;

        this._tempState.blendMode = batch.blendMode;

        renderer.state.set(this._tempState);

        const textures = batch.textures.textures;

        for (let i = 0; i < batch.textures.count; i++)
        {
            renderer.texture.bind(textures[i], i);
        }

        renderer.geometry.draw(batch.topology, batch.size, batch.start);
    }
}
