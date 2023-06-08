import { ImageSource } from '../../src/rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';

export function getTexture()
{
    const canvas = document.createElement('canvas');

    canvas.width = 20;
    canvas.height = 20;

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
