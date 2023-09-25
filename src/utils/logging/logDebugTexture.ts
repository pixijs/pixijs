import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../rendering/renderers/types';

export async function logDebugTexture(texture: Texture, renderer: Renderer, size = 200)
{
    const base64 = await renderer.extract.base64(texture);

    await renderer.encoder.commandFinished;

    const width = size;

    // eslint-disable-next-line no-console
    console.log(`logging texture ${texture.source.width}px ${texture.source.height}px`);

    const style = [
        'font-size: 1px;',
        `padding: ${width}px ${300}px;`,
        `background: url(${base64}) no-repeat;`,
        'background-size: contain;',
    ].join(' ');

    // eslint-disable-next-line no-console
    console.log('%c ', style);
}
