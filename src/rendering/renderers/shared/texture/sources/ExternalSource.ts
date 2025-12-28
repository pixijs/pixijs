import {
    type ExtensionMetadata,
    ExtensionType,
} from '../../../../../extensions/Extensions';
import { TextureSource } from './TextureSource';

/**
 * A texture source that uses a resource uploaded via an external library (eg. Three.js)
 * @category rendering
 * @advanced
 */
export class ExternalSource extends TextureSource<
    GPUTexture | WebGLTexture
>
{
    public static extension: ExtensionMetadata = ExtensionType.TextureSource;

    public uploadMethodId = 'external';

    public static test(
        resource: unknown,
    ): resource is GPUTexture | WebGLTexture
    {
        return (
            resource instanceof GPUTexture || resource instanceof WebGLTexture
        );
    }

    public get resourceWidth(): number
    {
        if (this.resource instanceof WebGLTexture)
        {
            return this.options.width ?? 1;
        }

        return super.resourceWidth;
    }

    public get resourceHeight(): number
    {
        if (this.resource instanceof WebGLTexture)
        {
            return this.options.height ?? 1;
        }

        return super.resourceHeight;
    }
}
