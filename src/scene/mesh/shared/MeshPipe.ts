import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { BindGroup } from '../../../rendering/renderers/gpu/shader/BindGroup';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { getAdjustedBlendModeBlend } from '../../../rendering/renderers/shared/state/getAdjustedBlendModeBlend';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';
import { BatchableMesh } from './BatchableMesh';

import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type {
    InstructionPipe,
    RenderPipe
} from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Mesh } from './Mesh';

// TODO Record mode is a P2, will get back to this as it's not a priority
// const recordMode = true;

interface MeshData
{
    batched: boolean;
    indexSize: number;
    vertexSize: number;
}

export interface MeshAdaptor
{
    init(): void;
    execute(meshPipe: MeshPipe, mesh: Mesh): void;
    destroy(): void;
}

export interface MeshInstruction extends Instruction
{
    renderPipeId: 'mesh';
    mesh: Mesh;
}

// eslint-disable-next-line max-len
export class MeshPipe implements RenderPipe<Mesh>, InstructionPipe<MeshInstruction>
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

    private _meshDataHash: Record<number, MeshData> = Object.create(null);
    private _gpuBatchableMeshHash: Record<number, BatchableMesh> = Object.create(null);
    private _adaptor: MeshAdaptor;

    constructor(renderer: Renderer, adaptor: MeshAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;

        this._adaptor.init();
    }

    public validateRenderable(mesh: Mesh): boolean
    {
        const meshData = this._getMeshData(mesh);

        const wasBatched = meshData.batched;

        const isBatched = mesh.batched;

        meshData.batched = isBatched;

        if (wasBatched !== isBatched)
        {
            return true;
        }
        else if (isBatched)
        {
            const geometry = mesh._geometry;

            // no need to break the batch if it's the same size
            if (geometry.indices.length !== meshData.indexSize
                    || geometry.positions.length !== meshData.vertexSize)
            {
                meshData.indexSize = geometry.indices.length;
                meshData.vertexSize = geometry.positions.length;

                return true;
            }

            const batchableMesh = this._getBatchableMesh(mesh);

            const texture = mesh.texture;

            if (batchableMesh.texture._source !== texture._source)
            {
                if (batchableMesh.texture._source !== texture._source)
                {
                    return !batchableMesh.batcher.checkAndUpdateTexture(batchableMesh, texture);
                }
            }
        }

        return false;
    }

    public addRenderable(mesh: Mesh, instructionSet: InstructionSet)
    {
        const batcher = this.renderer.renderPipes.batch;

        const { batched } = this._getMeshData(mesh);

        if (batched)
        {
            const gpuBatchableMesh = this._getBatchableMesh(mesh);

            gpuBatchableMesh.texture = mesh._texture;
            gpuBatchableMesh.geometry = mesh._geometry;

            batcher.addToBatch(gpuBatchableMesh);
        }
        else
        {
            batcher.break(instructionSet);

            instructionSet.add({
                renderPipeId: 'mesh',
                mesh
            } as MeshInstruction);
        }
    }

    public updateRenderable(mesh: Mesh)
    {
        if (mesh.batched)
        {
            const gpuBatchableMesh = this._gpuBatchableMeshHash[mesh.uid];

            gpuBatchableMesh.texture = mesh._texture;
            gpuBatchableMesh.geometry = mesh._geometry;

            gpuBatchableMesh.batcher.updateElement(gpuBatchableMesh);
        }
    }

    public destroyRenderable(mesh: Mesh)
    {
        this._meshDataHash[mesh.uid] = null;

        const gpuMesh = this._gpuBatchableMeshHash[mesh.uid];

        if (gpuMesh)
        {
            BigPool.return(gpuMesh as PoolItem);
            this._gpuBatchableMeshHash[mesh.uid] = null;
        }
    }

    public execute({ mesh }: MeshInstruction)
    {
        if (!mesh.isRenderable) return;

        mesh.state.blendMode = getAdjustedBlendModeBlend(mesh.groupBlendMode, mesh.texture._source);

        const localUniforms = this.localUniforms;

        localUniforms.uniforms.uTransformMatrix = mesh.groupTransform;
        localUniforms.uniforms.uRound = this.renderer._roundPixels | mesh._roundPixels;
        localUniforms.update();

        color32BitToUniform(
            mesh.groupColorAlpha,
            localUniforms.uniforms.uColor,
            0
        );

        this._adaptor.execute(this, mesh);
    }

    private _getMeshData(mesh: Mesh): MeshData
    {
        return this._meshDataHash[mesh.uid] || this._initMeshData(mesh);
    }

    private _initMeshData(mesh: Mesh): MeshData
    {
        this._meshDataHash[mesh.uid] = {
            batched: mesh.batched,
            indexSize: mesh._geometry.indices?.length,
            vertexSize: mesh._geometry.positions?.length,
        };

        mesh.on('destroyed', () =>
        {
            this.destroyRenderable(mesh);
        });

        return this._meshDataHash[mesh.uid];
    }

    private _getBatchableMesh(mesh: Mesh): BatchableMesh
    {
        return this._gpuBatchableMeshHash[mesh.uid] || this._initBatchableMesh(mesh);
    }

    private _initBatchableMesh(mesh: Mesh): BatchableMesh
    {
        // TODO - make this batchable graphics??
        const gpuMesh: BatchableMesh = BigPool.get(BatchableMesh);

        gpuMesh.mesh = mesh;
        gpuMesh.texture = mesh._texture;
        gpuMesh.roundPixels = (this.renderer._roundPixels | mesh._roundPixels) as 0 | 1;

        this._gpuBatchableMeshHash[mesh.uid] = gpuMesh;

        gpuMesh.mesh = mesh;

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
        this._meshDataHash = null;

        this.localUniforms = null;
        this.localUniformsBindGroup = null;

        this._adaptor.destroy();
        this._adaptor = null;

        this.renderer = null;
    }
}
