import { ExtensionType } from '../../../../extensions/Extensions';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { Point } from '../../../../maths/point/Point';
import { color32BitToUniform } from '../../../../scene/graphics/gpu/colorToUniform';
import { BindGroup } from '../../gpu/shader/BindGroup';
import { type Renderer, RendererType } from '../../types';
import { UniformGroup } from '../shader/UniformGroup';

import type { PointData } from '../../../../maths/point/PointData';
import type { GlRenderTargetSystem } from '../../gl/renderTarget/GlRenderTargetSystem';
import type { GpuRenderTargetSystem } from '../../gpu/renderTarget/GpuRenderTargetSystem';
import type { WebGPURenderer } from '../../gpu/WebGPURenderer';
import type { UboSystem } from '../shader/UboSystem';
import type { System } from '../system/System';

export type GlobalUniformGroup = UniformGroup<{
    uProjectionMatrix: { value: Matrix; type: 'mat3x3<f32>' }
    uWorldTransformMatrix: { value: Matrix; type: 'mat3x3<f32>' }
    uWorldColorAlpha: { value: Float32Array; type: 'vec4<f32>' }
    uResolution: { value: number[]; type: 'vec2<f32>' }
}>;

export interface GlobalUniformOptions
{
    size?: number[],
    projectionMatrix?: Matrix,
    worldTransformMatrix?: Matrix
    worldColor?: number
    offset?: PointData
}

export interface GlobalUniformData
{
    projectionMatrix: Matrix
    worldTransformMatrix: Matrix
    worldColor: number
    resolution: number[]
    offset: PointData
    bindGroup: BindGroup
}

export interface GlobalUniformRenderer
{
    renderTarget: GlRenderTargetSystem | GpuRenderTargetSystem
    renderPipes: Renderer['renderPipes'];
    ubo: UboSystem;
    type: RendererType;
}

/**
 * System plugin to the renderer to manage global uniforms for the renderer.
 * @memberof rendering
 */
export class GlobalUniformSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'globalUniforms',
    } as const;

    private readonly _renderer: GlobalUniformRenderer;

    private _stackIndex = 0;
    private _globalUniformDataStack: GlobalUniformData[] = [];

    private readonly _uniformsPool: GlobalUniformGroup[] = [];
    private readonly _activeUniforms: GlobalUniformGroup[] = [];

    private readonly _bindGroupPool: BindGroup[] = [];
    private readonly _activeBindGroups: BindGroup[] = [];

    private _currentGlobalUniformData: GlobalUniformData;

    constructor(renderer: GlobalUniformRenderer)
    {
        this._renderer = renderer;
    }

    public reset()
    {
        this._stackIndex = 0;

        for (let i = 0; i < this._activeUniforms.length; i++)
        {
            this._uniformsPool.push(this._activeUniforms[i]);
        }

        for (let i = 0; i < this._activeBindGroups.length; i++)
        {
            this._bindGroupPool.push(this._activeBindGroups[i]);
        }

        this._activeUniforms.length = 0;
        this._activeBindGroups.length = 0;
    }

    public start(options: GlobalUniformOptions): void
    {
        this.reset();

        this.push(options);
    }

    public bind({
        size,
        projectionMatrix,
        worldTransformMatrix,
        worldColor,
        offset,
    }: GlobalUniformOptions)
    {
        const renderTarget = this._renderer.renderTarget.renderTarget;

        const currentGlobalUniformData = this._stackIndex ? this._globalUniformDataStack[this._stackIndex - 1] : {
            projectionData: renderTarget,
            worldTransformMatrix: new Matrix(),
            worldColor: 0xFFFFFFFF,
            offset: new Point(),
        };

        const globalUniformData: GlobalUniformData = {
            projectionMatrix: projectionMatrix || this._renderer.renderTarget.projectionMatrix,
            resolution: size || renderTarget.size,
            worldTransformMatrix: worldTransformMatrix || currentGlobalUniformData.worldTransformMatrix,
            worldColor: worldColor || currentGlobalUniformData.worldColor,
            offset: offset || currentGlobalUniformData.offset,
            bindGroup: null,
        };

        const uniformGroup = this._uniformsPool.pop() || this._createUniforms();

        this._activeUniforms.push(uniformGroup);

        const uniforms = uniformGroup.uniforms;

        uniforms.uProjectionMatrix = globalUniformData.projectionMatrix;

        uniforms.uResolution = globalUniformData.resolution;

        uniforms.uWorldTransformMatrix.copyFrom(globalUniformData.worldTransformMatrix);

        uniforms.uWorldTransformMatrix.tx -= globalUniformData.offset.x;
        uniforms.uWorldTransformMatrix.ty -= globalUniformData.offset.y;

        color32BitToUniform(
            globalUniformData.worldColor,
            uniforms.uWorldColorAlpha,
            0
        );

        uniformGroup.update();

        let bindGroup: BindGroup;

        if ((this._renderer as WebGPURenderer).renderPipes.uniformBatch)
        {
            bindGroup = (this._renderer as WebGPURenderer).renderPipes.uniformBatch.getUniformBindGroup(uniformGroup, false);
        }
        else
        {
            bindGroup = this._bindGroupPool.pop() || new BindGroup();
            this._activeBindGroups.push(bindGroup);
            bindGroup.setResource(uniformGroup, 0);
        }

        globalUniformData.bindGroup = bindGroup;

        this._currentGlobalUniformData = globalUniformData;
    }

    public push(options: GlobalUniformOptions)
    {
        this.bind(options);

        this._globalUniformDataStack[this._stackIndex++] = this._currentGlobalUniformData;
    }

    public pop()
    {
        this._currentGlobalUniformData = this._globalUniformDataStack[--this._stackIndex - 1];

        // for webGL we need to update the uniform group here
        // as we are not using bind groups
        if (this._renderer.type === RendererType.WEBGL)
        {
            (this._currentGlobalUniformData.bindGroup.resources[0] as UniformGroup).update();
        }
    }

    get bindGroup(): BindGroup
    {
        return this._currentGlobalUniformData.bindGroup;
    }

    get globalUniformData()
    {
        return this._currentGlobalUniformData;
    }

    get uniformGroup()
    {
        return this._currentGlobalUniformData.bindGroup.resources[0] as UniformGroup;
    }

    private _createUniforms(): GlobalUniformGroup
    {
        const globalUniforms = new UniformGroup({
            uProjectionMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uWorldTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            // TODO - someone smart - set this to be a unorm8x4 rather than a vec4<f32>
            uWorldColorAlpha: { value: new Float32Array(4), type: 'vec4<f32>' },
            uResolution: { value: [0, 0], type: 'vec2<f32>' },
        }, {
            isStatic: true,
        });

        return globalUniforms;
    }

    public destroy()
    {
        (this._renderer as null) = null;
    }
}
