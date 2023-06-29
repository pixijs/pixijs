import { ExtensionType } from '../../../../extensions/Extensions';
import { Buffer } from '../buffer/Buffer';
import { BufferUsage } from '../buffer/const';
import { createUBOElements } from './utils/createUBOElements';
import { generateUniformBufferSync } from './utils/createUniformBufferSync';

import type { Renderer } from '../../types';
import type { ISystem } from '../system/System';
import type { UniformGroup } from './UniformGroup';
import type { UniformBufferLayout } from './utils/createUBOElements';
import type { UniformsSyncCallback } from './utils/createUniformBufferSync';

export class UniformBufferSystem implements ISystem
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'uniformBuffer',
    } as const;

    readonly renderer: Renderer;

    /** Cache of uniform buffer layouts and sync functions, so we don't have to re-create them */
    private _syncFunctionHash: Record<string, {
        layout: UniformBufferLayout,
        syncFunction: (uniforms: Record<string, any>, data: Float32Array, offset: number) => void
    }> = {};

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    ensureUniformGroup(uniformGroup: UniformGroup): void
    {
        if (!uniformGroup._syncFunction)
        {
            this.initUniformGroup(uniformGroup);
        }
    }

    initUniformGroup(uniformGroup: UniformGroup): UniformsSyncCallback
    {
        const uniformGroupSignature = uniformGroup.signature;

        let uniformData = this._syncFunctionHash[uniformGroupSignature];

        if (!uniformData)
        {
            const elements = Object.keys(uniformGroup.uniformStructures).map((i) => uniformGroup.uniformStructures[i]);

            const layout = createUBOElements(elements);

            const syncFunction = generateUniformBufferSync(layout.uboElements);

            uniformData = this._syncFunctionHash[uniformGroupSignature] = {
                layout,
                syncFunction
            };
        }

        uniformGroup._syncFunction = uniformData.syncFunction;

        uniformGroup.buffer = new Buffer({
            data: new Float32Array(uniformData.layout.size / 4),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        return uniformGroup._syncFunction;
    }

    syncUniformGroup(uniformGroup: UniformGroup, data?: Float32Array, offset?: number): boolean
    {
        const syncFunction = uniformGroup._syncFunction || this.initUniformGroup(uniformGroup);

        data ||= (uniformGroup.buffer.data as Float32Array);
        offset ||= 0;

        syncFunction(uniformGroup.uniforms, data, offset);

        return true;
    }

    updateUniformGroup(uniformGroup: UniformGroup): boolean
    {
        if (uniformGroup.isStatic && !uniformGroup.dirtyId) return false;
        uniformGroup.dirtyId = 0;

        const synced = this.syncUniformGroup(uniformGroup);

        uniformGroup.buffer.update();

        return synced;
    }

    destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}
