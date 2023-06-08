import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { State } from '../../renderers/shared/state/State';
import { Texture } from '../../renderers/shared/texture/Texture';
import { BatchableMesh } from './BatchableMesh';
import { MeshShader } from './MeshShader';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type {
    InstructionPipe,
    RenderPipe
} from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
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
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'mesh',
    };

    localUniforms = new UniformGroup({
        transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
    });

    localUniformsBindGroup = new BindGroup({
        0: this.localUniforms,
    });

    meshShader = new MeshShader({
        texture: Texture.EMPTY,
    });

    renderer: Renderer;
    state: State = State.for2d();

    private renderableHash: Record<number, RenderableData> = {};
    private gpuBatchableMeshHash: Record<number, BatchableMesh> = {};
    private adaptor: MeshAdaptor;

    constructor(renderer: Renderer, adaptor: MeshAdaptor)
    {
        this.renderer = renderer;
        this.adaptor = adaptor;
    }

    validateRenderable(renderable: Renderable<MeshView>): boolean
    {
        const renderableData = this.getRenderableData(renderable);

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

            const batchableMesh = this.getBatchableMesh(renderable);

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

    addRenderable(renderable: Renderable<MeshView>, instructionSet: InstructionSet)
    {
        const batcher = this.renderer.renderPipes.batch;

        const { batched } = this.getRenderableData(renderable);

        if (batched)
        {
            const gpuBatchableMesh = this.getBatchableMesh(renderable);

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

    updateRenderable(renderable: Renderable<MeshView>)
    {
        if (renderable.view.batched)
        {
            const gpuBatchableMesh = this.gpuBatchableMeshHash[renderable.uid];

            gpuBatchableMesh.texture = renderable.view._texture;

            gpuBatchableMesh.batcher.updateElement(gpuBatchableMesh);
        }
    }

    execute({ renderable }: MeshInstruction)
    {
        if (!renderable.isRenderable) return;

        this.adaptor.execute(this, renderable);
    }

    private getRenderableData(renderable: Renderable<MeshView>): RenderableData
    {
        return this.renderableHash[renderable.uid] || this.initRenderableData(renderable);
    }

    private initRenderableData(renderable: Renderable<MeshView>): RenderableData
    {
        const view = renderable.view;

        this.renderableHash[renderable.uid] = {
            batched: view.batched,
            indexSize: view._geometry.indices.length,
            vertexSize: view._geometry.positions.length,
        };

        return this.renderableHash[renderable.uid];
    }

    private getBatchableMesh(renderable: Renderable<MeshView>): BatchableMesh
    {
        return this.gpuBatchableMeshHash[renderable.uid] || this.initBatchableMesh(renderable);
    }

    private initBatchableMesh(renderable: Renderable<MeshView>): BatchableMesh
    {
        // TODO - make this batchable graphics??
        const gpuMesh: BatchableMesh = new BatchableMesh();

        gpuMesh.renderable = renderable;

        this.gpuBatchableMeshHash[renderable.uid] = gpuMesh;

        gpuMesh.renderable = renderable;

        return gpuMesh;
    }
}
