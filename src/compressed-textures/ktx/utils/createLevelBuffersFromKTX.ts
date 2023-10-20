import type { KTXTexture } from '../types';

export function createLevelBuffersFromKTX(ktxTexture: KTXTexture): Uint8Array[]
{
    const levelBuffers = [];

    // create the levels..
    for (let i = 0; i < ktxTexture.numLevels; i++)
    {
        const imageData = ktxTexture.getImageData(i, 0, 0);

        const levelBuffer = new Uint8Array(imageData.byteLength);

        levelBuffer.set(imageData);

        levelBuffers.push(levelBuffer);
    }

    return levelBuffers;
}
