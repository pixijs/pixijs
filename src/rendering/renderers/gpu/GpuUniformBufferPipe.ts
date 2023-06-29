import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferUsage } from '../shared/buffer/const';
import { BindGroup } from './shader/BindGroup';

import type { PoolItem } from '../../../utils/pool/Pool';
import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { WebGPURenderer } from './WebGPURenderer';

class UniformBindGroup extends BindGroup
{
    constructor()
    {
        super({
            0: new Buffer({
                data: new Float32Array(128),
                usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
            }),
        });
    }

    get buffer(): Buffer
    {
        return this.resources[0] as Buffer;
    }

    get data(): Float32Array
    {
        return (this.resources[0] as Buffer).data as Float32Array;
    }
}

export class GpuUniformBufferPipe
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPURendererPipes,
        ],
        name: 'uniformBuffer',
    } as const;

    private activeBindGroups: BindGroup[] = [];
    private activeBindGroupIndex = 0;
    private renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;
    }

    getUniformBindGroup(uniformGroup: UniformGroup)
    {
        const renderer = this.renderer;

        renderer.uniformBuffer.ensureUniformGroup(uniformGroup);

        const bindGroup = BigPool.get(UniformBindGroup);

        renderer.uniformBuffer.syncUniformGroup(uniformGroup, bindGroup.data, 0);

        bindGroup.buffer.update(uniformGroup.buffer.data.byteLength);

        this.activeBindGroups[this.activeBindGroupIndex++] = bindGroup;

        return bindGroup;
    }

    renderEnd()
    {
        for (let i = 0; i < this.activeBindGroupIndex; i++)
        {
            BigPool.return(this.activeBindGroups[i] as PoolItem);
        }

        this.activeBindGroupIndex = 0;
    }
}
