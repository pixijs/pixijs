import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { BindGroup } from '../../../rendering/renderers/gpu/shader/BindGroup';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';
import { BatchableMesh } from './BatchableMesh';

import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type {
    InstructionPipe,
    RenderPipe
} from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { MeshGeometry } from './MeshGeometry';
import type { MeshView } from './MeshView';

// TODO Record mode is a P2, will get back to this as it's not a priority
// const recordMode = true;

interface RenderableData
{
    batched: boolean;
    indexSize: number;
    vertexSize: number;
}

export interface MeshAdaptor
{
    init(): void;
    execute(meshPipe: MeshPipe, renderable: Renderable<MeshView>): void;
    destroy(): void;
}

export interface MeshInstruction extends Instruction
{
    renderPipeId: 'mesh';
    renderable: Renderable<MeshView>;
}

// eslint-disable-next-line max-len
export class MeshPipe implements RenderPipe<MeshView>, InstructionPipe<MeshInstruction>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'mesh',
    } as const;

    public localUniforms = new UniformGroup({
        uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
        uRound: { value: 0, type: 'f32' },
    });

    public localUniformsBindGroup = new BindGroup({
        0: this.localUniforms,
    });

    public renderer: Renderer;

    private _renderableHash: Record<number, RenderableData> = Object.create(null);
    private _gpuBatchableMeshHash: Record<number, BatchableMesh> = Object.create(null);
    private _adaptor: MeshAdaptor;

    constructor(renderer: Renderer, adaptor: MeshAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;

        this._adaptor.init();
    }

    public validateRenderable(renderable: Renderable<MeshView>): boolean
    {
        const renderableData = this._getRenderableData(renderable);

        const wasBatched = renderableData.batched;

        const isBatched = renderable.view.batched;

        renderableData.batched = isBatched;

        if (wasBatched !== isBatched)
        {
            return true;
        }
        else if (isBatched)
        {
            const geometry = renderable.view._geometry;

            // no need to break the batch if it's the same size
            if (geometry.indices.length !== renderableData.indexSize
                    || geometry.positions.length !== renderableData.vertexSize)
            {
                renderableData.indexSize = geometry.indices.length;
                renderableData.vertexSize = geometry.positions.length;

                return true;
            }

            const batchableMesh = this._getBatchableMesh(renderable);

            const texture = renderable.view.texture;

            if (batchableMesh.texture._source !== texture._source)
            {
                if (batchableMesh.texture._source !== texture._source)
                {
                    return batchableMesh.batcher.checkAndUpdateTexture(batchableMesh, texture);
                }
            }
        }

        return false;
    }

    public addRenderable(renderable: Renderable<MeshView>, instructionSet: InstructionSet)
    {
        const batcher = this.renderer.renderPipes.batch;

        const { batched } = this._getRenderableData(renderable);

        if (batched)
        {
            const gpuBatchableMesh = this._getBatchableMesh(renderable);

            gpuBatchableMesh.texture = renderable.view._texture;

            batcher.addToBatch(gpuBatchableMesh);
        }
        else
        {
            batcher.break(instructionSet);

            instructionSet.add({
                renderPipeId: 'mesh',
                renderable
            } as MeshInstruction);
        }
    }

    public updateRenderable(renderable: Renderable<MeshView>)
    {
        if (renderable.view.batched)
        {
            const gpuBatchableMesh = this._gpuBatchableMeshHash[renderable.uid];

            gpuBatchableMesh.texture = renderable.view._texture;

            gpuBatchableMesh.batcher.updateElement(gpuBatchableMesh);
        }
    }

    public destroyRenderable(renderable: Renderable<MeshView<MeshGeometry>>)
    {
        this._renderableHash[renderable.uid] = null;

        const gpuMesh = this._gpuBatchableMeshHash[renderable.uid];

        BigPool.return(gpuMesh as PoolItem);

        this._gpuBatchableMeshHash[renderable.uid] = null;
    }

    public execute({ renderable }: MeshInstruction)
    {
        if (!renderable.isRenderable) return;

        const view = renderable.view;

        view.state.blendMode = renderable.rgBlendMode;

        const localUniforms = this.localUniforms;

        localUniforms.uniforms.uTransformMatrix = renderable.rgTransform;
        localUniforms.uniforms.uRound = this.renderer._roundPixels | renderable.view.roundPixels;
        localUniforms.update();

        color32BitToUniform(
            renderable.rgColorAlpha,
            localUniforms.uniforms.uColor,
            0
        );

        this._adaptor.execute(this, renderable);
    }

    private _getRenderableData(renderable: Renderable<MeshView>): RenderableData
    {
        return this._renderableHash[renderable.uid] || this._initRenderableData(renderable);
    }

    private _initRenderableData(renderable: Renderable<MeshView>): RenderableData
    {
        const view = renderable.view;

        this._renderableHash[renderable.uid] = {
            batched: view.batched,
            indexSize: view._geometry.indices.length,
            vertexSize: view._geometry.positions.length,
        };

        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return this._renderableHash[renderable.uid];
    }

    private _getBatchableMesh(renderable: Renderable<MeshView>): BatchableMesh
    {
        return this._gpuBatchableMeshHash[renderable.uid] || this._initBatchableMesh(renderable);
    }

    private _initBatchableMesh(renderable: Renderable<MeshView>): BatchableMesh
    {
        // TODO - make this batchable graphics??
        const gpuMesh: BatchableMesh = BigPool.get(BatchableMesh);

        gpuMesh.renderable = renderable;
        gpuMesh.texture = renderable.view._texture;
        gpuMesh.roundPixels = (this.renderer._roundPixels | renderable.view.roundPixels) as 0 | 1;

        this._gpuBatchableMeshHash[renderable.uid] = gpuMesh;

        gpuMesh.renderable = renderable;

        return gpuMesh;
    }

    public destroy()
    {
        for (const i in this._gpuBatchableMeshHash)
        {
            if (this._gpuBatchableMeshHash[i])
            {
                BigPool.return(this._gpuBatchableMeshHash[i] as PoolItem);
            }
        }

        this._gpuBatchableMeshHash = null;
        this._renderableHash = null;

        this.localUniforms = null;
        this.localUniformsBindGroup = null;

        this._adaptor.destroy();
        this._adaptor = null;

        this.renderer = null;
    }
}
