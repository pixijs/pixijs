import { ExtensionType } from '../../../../extensions/Extensions';
import { Matrix } from '../../../../maths/Matrix';
import { Point } from '../../../../maths/Point';
import { BindGroup } from '../../gpu/shader/BindGroup';
import { UniformGroup } from '../shader/UniformGroup';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { PointData } from '../../../../maths/PointData';
import type { GlRenderTargetSystem } from '../../gl/GlRenderTargetSystem';
import type { GpuRenderTargetSystem } from '../../gpu/renderTarget/GpuRenderTargetSystem';
import type { WebGPURenderer } from '../../gpu/WebGPURenderer';
import type { Renderer } from '../../types';
import type { UniformBufferSystem } from '../shader/UniformBufferSystem';
import type { ISystem } from '../system/ISystem';

export type GlobalUniformGroup = UniformGroup<{
    projectionMatrix: { value: Matrix; type: 'mat3x3<f32>' }
    worldTransformMatrix: { value: Matrix; type: 'mat3x3<f32>' }
    worldAlpha: { value: number; type: 'f32' }
}>;

export interface GlobalUniformOptions
{
    projectionMatrix?: Matrix
    worldTransformMatrix?: Matrix
    worldColor?: number
    offset?: PointData
}

export interface GlobalUniformData
{
    projectionMatrix: Matrix
    worldTransformMatrix: Matrix
    worldColor: number
    offset: PointData
    bindGroup: BindGroup
}

interface GlobalUniformRenderer
{
    renderTarget: GlRenderTargetSystem | GpuRenderTargetSystem
    renderPipes: Renderer['renderPipes'];
    uniformBuffer: UniformBufferSystem;
}

export class GlobalUniformSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
            ExtensionType.WebGPURendererSystem,
            ExtensionType.CanvasRendererSystem,
        ],
        name: 'globalUniforms',
    };

    private renderer: GlobalUniformRenderer;

    private stackIndex = 0;
    private globalUniformDataStack: GlobalUniformData[] = [];

    private uniformsPool: GlobalUniformGroup[] = [];
    private activeUniforms: GlobalUniformGroup[] = [];

    private bindGroupPool: BindGroup[] = [];
    private activeBindGroups: BindGroup[] = [];

    private currentGlobalUniformData: GlobalUniformData;

    constructor(renderer: GlobalUniformRenderer)
    {
        this.renderer = renderer;
    }

    reset()
    {
        this.stackIndex = 0;

        for (let i = 0; i < this.activeUniforms.length; i++)
        {
            this.uniformsPool.push(this.activeUniforms[i]);
        }

        for (let i = 0; i < this.activeBindGroups.length; i++)
        {
            this.bindGroupPool.push(this.activeBindGroups[i]);
        }

        this.activeUniforms.length = 0;
        this.activeBindGroups.length = 0;
    }

    start(options: GlobalUniformOptions): void
    {
        this.reset();

        this.push(options);
    }

    bind({
        projectionMatrix,
        worldTransformMatrix,
        worldColor,
        offset,
    }: GlobalUniformOptions)
    {
        const currentGlobalUniformData = this.stackIndex ? this.globalUniformDataStack[this.stackIndex - 1] : {
            projectionMatrix: this.renderer.renderTarget.renderTarget.projectionMatrix,
            worldTransformMatrix: new Matrix(),
            worldColor: 0xFFFFFFFF,
            offset: new Point(),
        };

        const globalUniformData: GlobalUniformData = {
            projectionMatrix: projectionMatrix || this.renderer.renderTarget.renderTarget.projectionMatrix,
            worldTransformMatrix: worldTransformMatrix || currentGlobalUniformData.worldTransformMatrix,
            worldColor: worldColor || currentGlobalUniformData.worldColor,
            offset: offset || currentGlobalUniformData.offset,
            bindGroup: null,
        };

        const uniformGroup = this.uniformsPool.pop() || this.createUniforms();

        this.activeUniforms.push(uniformGroup);

        const uniforms = uniformGroup.uniforms;

        uniforms.projectionMatrix = globalUniformData.projectionMatrix;
        uniforms.worldTransformMatrix.copyFrom(globalUniformData.worldTransformMatrix);

        uniforms.worldTransformMatrix.tx -= globalUniformData.offset.x;
        uniforms.worldTransformMatrix.ty -= globalUniformData.offset.y;

        // TODO - this should be the full rgb color...
        uniforms.worldAlpha = ((globalUniformData.worldColor >> 24) & 0xFF) / 255;

        uniformGroup.update();

        let bindGroup: BindGroup;

        if ((this.renderer as WebGPURenderer).renderPipes.uniformBatch)
        {
            bindGroup = (this.renderer as WebGPURenderer).renderPipes.uniformBatch.getUniformBindGroup(uniformGroup, false);
        }
        else
        {
            this.renderer.uniformBuffer.updateUniformGroup(uniformGroup as UniformGroup);

            bindGroup = this.bindGroupPool.pop() || new BindGroup();
            this.activeBindGroups.push(bindGroup);
            bindGroup.setResource(uniformGroup, 0);
        }

        globalUniformData.bindGroup = bindGroup;

        this.currentGlobalUniformData = globalUniformData;
    }

    push(options: GlobalUniformOptions)
    {
        this.bind(options);

        this.globalUniformDataStack[this.stackIndex++] = this.currentGlobalUniformData;
    }

    pop()
    {
        this.currentGlobalUniformData = this.globalUniformDataStack[--this.stackIndex - 1];
    }

    get bindGroup(): BindGroup
    {
        return this.currentGlobalUniformData.bindGroup;
    }

    get uniformGroup()
    {
        return this.currentGlobalUniformData.bindGroup.resources[0] as UniformGroup;
    }

    private createUniforms(): GlobalUniformGroup
    {
        const globalUniforms = new UniformGroup({
            projectionMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            worldTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            // TODO - someone smart - set this to be a unorm8x4 rather than a vec4<f32>
            worldAlpha: { value: 1, type: 'f32' },
        }, {
            ubo: true,
            isStatic: true,
        });

        return globalUniforms;
    }

    destroy()
    {
        // boom!
    }
}
