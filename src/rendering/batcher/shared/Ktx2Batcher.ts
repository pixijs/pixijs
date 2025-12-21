import { ExtensionType } from '../../../extensions/Extensions';
import { DefaultBatcher } from './DefaultBatcher';
import { Ktx2Shader } from './Ktx2Shader';

import type { BatcherOptions } from './Batcher';

let ktx2Shader: Ktx2Shader = null;

/**
 * Ktx2Batcher is a specialized batcher for KTX2/Basis Universal compressed textures.
 *
 * KTX2 textures use non-premultiplied alpha, so this batcher uses Ktx2Shader which
 * doesn't premultiply alpha in the vertex shader, allowing correct alpha transparency.
 *
 * This batcher should be used for sprites with KTX2 textures by setting
 * `sprite.batcherName = 'ktx2'`.
 * @category rendering
 * @advanced
 */
export class Ktx2Batcher extends DefaultBatcher
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.Batcher,
        ],
        name: 'ktx2',
    } as any;

    public shader: Ktx2Shader;

    constructor(options: BatcherOptions)
    {
        super(options);

        // Override name property - set after super() to avoid type conflict in declaration files
        (this as any).name = Ktx2Batcher.extension.name;

        // Create KTX2 shader with non-premultiply alpha support
        ktx2Shader ??= new Ktx2Shader(options.maxTextures);

        this.shader = ktx2Shader;
    }

    /**
     * Updates the maximum number of textures that can be used in the shader.
     * @param maxTextures - The maximum number of textures that can be used in the shader.
     * @internal
     */
    public _updateMaxTextures(maxTextures: number): void
    {
        if (this.shader.maxTextures === maxTextures) return;
        ktx2Shader = new Ktx2Shader(maxTextures);
        this.shader = ktx2Shader;
    }

    public override destroy(): void
    {
        // do not destroy ktx2 shader!
        this.shader = null;
        super.destroy();
    }
}

