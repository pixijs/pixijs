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
    public static extension = {
        type: [
            ExtensionType.WebGPUPipes,
        ],
        name: 'uniformBuffer',
    } as const;

    private _activeBindGroups: BindGroup[] = [];
    private _activeBindGroupIndex = 0;
    private readonly _renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    public getUniformBindGroup(uniformGroup: UniformGroup)
    {
        const renderer = this._renderer;

        renderer.uniformBuffer.ensureUniformGroup(uniformGroup);

        const bindGroup = BigPool.get(UniformBindGroup);

        renderer.uniformBuffer.syncUniformGroup(uniformGroup, bindGroup.data, 0);

        bindGroup.buffer.update(uniformGroup.buffer.data.byteLength);

        this._activeBindGroups[this._activeBindGroupIndex++] = bindGroup;

        return bindGroup;
    }

    public renderEnd()
    {
        for (let i = 0; i < this._activeBindGroupIndex; i++)
        {
            BigPool.return(this._activeBindGroups[i] as PoolItem);
        }

        this._activeBindGroupIndex = 0;
    }
}
