import { ImageSource } from '../../src/rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';

export function getTexture({ width = 20, height = 20 } = {})
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    // fill canvas with white
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const defaultTexture = new Texture({
        source: new ImageSource({
            resource: canvas
        })
    });

    defaultTexture.label = 'defaultTexture';

    return defaultTexture;
}
