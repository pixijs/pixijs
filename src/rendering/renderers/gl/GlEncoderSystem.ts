import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { Bounds } from '../../scene/bounds/Bounds';
import type { GpuRenderTarget } from '../gpu/renderTarget/GpuRenderTarget';
import type { BindGroup } from '../gpu/shader/BindGroup';
import type { Topology } from '../shared/geometry/const';
import type { Geometry } from '../shared/geometry/Geometry';
import type { RenderTarget } from '../shared/renderTarget/RenderTarget';
import type { Shader } from '../shared/shader/Shader';
import type { State } from '../shared/state/State';
import type { ISystem } from '../shared/system/ISystem';
import type { WebGLRenderer } from './WebGLRenderer';

export class GlEncoderSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'encoder',
    };

    readonly commandFinished = Promise.resolve();
    private renderer: WebGLRenderer;
    // private gl: WebGL2RenderingContext;

    constructor(renderer: WebGLRenderer)
    {
        this.renderer = renderer;
    }

    start(): void
    {
        // generate a render pass description..
    }

    // protected contextChange(gl: GlRenderingContext): void
    // {
    //     this.gl = gl;
    // }

    beginRenderPass(renderTarget: RenderTarget, _gpuRenderTarget: GpuRenderTarget)
    {
        this.setViewport(renderTarget.viewport);
    }

    setViewport(_viewport: Rectangle): void
    {
        // this.renderPassEncoder.setViewport(
        //     viewport.x,
        //     viewport.y,
        //     viewport.width,
        //     viewport.height,
        //     0, 1);
    }

    setScissor(bounds: Bounds): void
    {
        bounds.fit(this.renderer.renderTarget.renderTarget.viewport);

        // this.renderPassEncoder.setScissorRect(
        //     bounds.minX,
        //     bounds.minY,
        //     bounds.width,
        //     bounds.height
        // );
    }

    clearScissor(): void
    {
        //  const viewport = this.renderer.renderTarget.renderTarget.viewport;

        // this.renderPassEncoder.setScissorRect(
        //     viewport.x,
        //     viewport.y,
        //     viewport.width,
        //     viewport.height
        // );
    }

    setGeometry(geometry: Geometry, shader?: Shader)
    {
        this.renderer.geometry.bind(geometry, shader.glProgram);
    }

    setShaderBindGroups(_shader: Shader, _sync?: boolean)
    {
        // for (const i in shader.groups)
        // {
        //     const bindGroup = shader.groups[i] as BindGroup;

        //     // update any uniforms?
        //     if (sync)
        //     {
        //         this.syncBindGroup(bindGroup);
        //     }

        //     this.setBindGroup(i, bindGroup, shader.gpuProgram);
        // }
    }

    syncBindGroup(_bindGroup: BindGroup)
    {
        // for (const j in bindGroup.resources)
        // {
        //     const resource = bindGroup.resources[j];

        //     if (resource.group)
        //     {
        //         this.renderer.uniformBuffer.updateUniformAndUploadGroup(resource);
        //     }
        // }
    }

    draw(options: {
        geometry: Geometry,
        shader: Shader,
        state?: State,
        topology?: Topology,
        size?: number,
        start?: number,
        instanceCount?: number
        skipSync?: boolean,
    })
    {
        const renderer = this.renderer;
        const { geometry, shader, state, skipSync, topology: type, size, start, instanceCount } = options;

        renderer.shader.bind(shader, skipSync);

        renderer.geometry.bind(geometry, renderer.shader.activeProgram);

        if (state)
        {
            renderer.state.set(state);
        }

        renderer.geometry.draw(type, size, start, instanceCount);
    }

    finishRenderPass()
    {
        // if (this.renderPassEncoder)
        // {
        //     this.renderPassEncoder.end();
        //     this.renderPassEncoder = null;
        // }
    }

    finish()
    {
        // this.finishRenderPass();

        // this.gpu.device.queue.submit([this.commandEncoder.finish()]);

        // this.resolveCommandFinished();
    }

    // restores a render pass if finishRenderPass was called
    // not optimised as really used for debugging!
    // used when we want to stop drawing and log a texture..
    restoreRenderPass()
    {
        // do stuff
    }

    destroy()
    {
        // boom!
    }
}
