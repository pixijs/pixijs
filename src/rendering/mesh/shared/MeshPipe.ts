import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { State } from '../../renderers/shared/state/State';
import { Texture } from '../../renderers/shared/texture/Texture';
import { BatchableMesh } from './BatchableMesh';
import { MeshShader } from './MeshShader';

import type { PoolItem } from '../../../utils/pool/Pool';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type {
    InstructionPipe,
    RenderPipe
} from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
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
    execute(meshPipe: MeshPipe, renderable: Renderable<MeshView>): void;
}

export interface MeshInstruction extends Instruction
{
    type: 'mesh';
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
        transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
    });

    public localUniformsBindGroup = new BindGroup({
        0: this.localUniforms,
    });

    public meshShader = new MeshShader({
        texture: Texture.EMPTY,
    });

    public renderer: Renderer;
    public state: State = State.for2d();

    private _renderableHash: Record<number, RenderableData> = {};
    private _gpuBatchableMeshHash: Record<number, BatchableMesh> = {};
    private _adaptor: MeshAdaptor;

    constructor(renderer: Renderer, adaptor: MeshAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;
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

            batcher.addToBatch(gpuBatchableMesh, instructionSet);
        }
        else
        {
            batcher.break(instructionSet);

            instructionSet.add({
                type: 'mesh',
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

        this.meshShader.destroy();
        this.meshShader = null;

        this._adaptor = null;

        this.renderer = null;
        this.state = null;
    }
}
