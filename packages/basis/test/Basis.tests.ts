import { BasisParser, loadBasis } from '@pixi/basis';
import { Loader } from '../../assets/src/loader/Loader';

import type { Texture } from '@pixi/core';

describe('Basis loading', () =>
{
    it('should load a a Basis image', async () =>
    {
        await BasisParser.loadTranscoder(
            'https://cdn.jsdelivr.net/npm/@pixi/basis@7.x/assets/basis_transcoder.js',
            'https://cdn.jsdelivr.net/npm/@pixi/basis@7.x/assets/basis_transcoder.wasm'
        );

        const loader = new Loader();

        loader['_parsers'].push(loadBasis);

        const texture = await loader.load<Texture>('https://pixijs.io/compressed-textures-example/images/kodim20.basis');

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(768);
        expect(texture.height).toBe(512);
    });
});
