import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { BindGroup } from '../../../rendering/renderers/gpu/shader/BindGroup';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { getAdjustedBlendModeBlend } from '../../../rendering/renderers/shared/state/getAdjustedBlendModeBlend';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';
import { type GPUData } from '../../view/ViewContainer';
import { BatchableMesh } from './BatchableMesh';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type {
    InstructionPipe,
    RenderPipe
} from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Mesh } from './Mesh';

// TODO Record mode is a P2, will get back to this as it's not a priority
// const recordMode = true;

/**
 * GPUData for Mesh
 * @internal
 */
export class MeshGpuData implements GPUData
{
    public meshData?: MeshData;
    public batchableMesh?: BatchableMesh;

    public destroy()
    {
        // BOOM!
    }
}

/**
 * The data for the mesh
 * @internal
 */
interface MeshData
{
    /** if the mesh is batched or not */
    batched: boolean;
    /** the size of the index buffer */
    indexSize: number;
    /** the size of the vertex buffer */
    vertexSize: number;
}

/** @internal */
export interface MeshAdaptor
{
    init(): void;
    execute(meshPipe: MeshPipe, mesh: Mesh): void;
    destroy(): void;
}

/**
 * The MeshPipe is responsible for handling the rendering of Mesh objects.
 * It manages the batching of meshes, updates their GPU data, and executes the rendering instructions.
 * It also handles the local uniforms for each mesh, such as transformation matrices and colors.
 * @category scene
 * @internal
 */
export class MeshPipe implements RenderPipe<Mesh>, InstructionPipe<Mesh>
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

            if (batchableMesh.texture.uid !== mesh._texture.uid)
            {
                batchableMesh._textureMatrixUpdateId = -1;
            }

            return !batchableMesh._batcher.checkAndUpdateTexture(
                batchableMesh,
                mesh._texture
            );
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

            gpuBatchableMesh.setTexture(mesh._texture);
            gpuBatchableMesh.geometry = mesh._geometry;

            batcher.addToBatch(gpuBatchableMesh, instructionSet);
        }
        else
        {
            batcher.break(instructionSet);

            instructionSet.add(mesh);
        }
    }

    public updateRenderable(mesh: Mesh)
    {
        if (mesh.batched)
        {
            const gpuBatchableMesh = this._getBatchableMesh(mesh);

            gpuBatchableMesh.setTexture(mesh._texture);

            gpuBatchableMesh.geometry = mesh._geometry;

            gpuBatchableMesh._batcher.updateElement(gpuBatchableMesh);
        }
    }

    public execute(mesh: Mesh)
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
        mesh._gpuData[this.renderer.uid] ||= new MeshGpuData();

        return mesh._gpuData[this.renderer.uid].meshData || this._initMeshData(mesh);
    }

    private _initMeshData(mesh: Mesh): MeshData
    {
        mesh._gpuData[this.renderer.uid].meshData = {
            batched: mesh.batched,
            indexSize: mesh._geometry.indices?.length,
            vertexSize: mesh._geometry.positions?.length,
        };

        return mesh._gpuData[this.renderer.uid].meshData;
    }

    private _getBatchableMesh(mesh: Mesh): BatchableMesh
    {
        mesh._gpuData[this.renderer.uid] ||= new MeshGpuData();

        return mesh._gpuData[this.renderer.uid].batchableMesh || this._initBatchableMesh(mesh);
    }

    private _initBatchableMesh(mesh: Mesh): BatchableMesh
    {
        // TODO - make this batchable graphics??
        const gpuMesh: BatchableMesh = new BatchableMesh();

        gpuMesh.renderable = mesh;
        gpuMesh.setTexture(mesh._texture);
        gpuMesh.transform = mesh.groupTransform;
        gpuMesh.roundPixels = (this.renderer._roundPixels | mesh._roundPixels) as 0 | 1;

        mesh._gpuData[this.renderer.uid].batchableMesh = gpuMesh;

        return gpuMesh;
    }

    public destroy()
    {
        this.localUniforms = null;
        this.localUniformsBindGroup = null;

        this._adaptor.destroy();
        this._adaptor = null;

        this.renderer = null;
    }
}
