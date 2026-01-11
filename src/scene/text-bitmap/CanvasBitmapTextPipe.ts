import { ExtensionType } from '../../extensions/Extensions';
import { BitmapTextPipe } from './BitmapTextPipe';

/** @internal */
export class CanvasBitmapTextPipe extends BitmapTextPipe
{
    /** @ignore */
    public static extension: { type: ExtensionType[]; name: 'bitmapText' } = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'bitmapText',
    } as const;

    protected shouldUseSdfShader(): boolean
    {
        return false;
    }
}
