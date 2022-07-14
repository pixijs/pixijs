import type { Texture } from '@pixi/core';
import { Loader } from '../src/loader/Loader';
import { loadDDS, loadKTX } from '@pixi/assets';

describe('Compressed Loader', () =>
{
    it('should load a ktx image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadKTX);

        // eslint-disable-next-line max-len
        const texture: Texture = await loader.load(`https://pixijs.io/compressed-textures-example/images/PixiJS-Logo_PNG_BC3_KTX.KTX`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(898);
        expect(texture.height).toBe(227);
    });

    it('should load a a DDS image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadDDS);

        // eslint-disable-next-line max-len
        const texture: Texture = await loader.load(`https://pixijs.io/compressed-textures-example/images/airplane-boeing_JPG_BC3_1.DDS`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(1000);
        expect(texture.height).toBe(664);
    });

    // CRASHES JEST - ELECTRON
    // it.only('should load a a Basis image', async () =>
    // {
    //     await BasisLoader.loadTranscoder(
    //         'https://cdn.jsdelivr.net/npm/@pixi/basis@6.3.2/assets/basis_transcoder.js',
    //         'https://cdn.jsdelivr.net/npm/@pixi/basis@6.3.2/assets/basis_transcoder.wasm'
    //     );

    //     //  console.log('DOING!!');
    //     const loader = new Loader();

    //     loader['_parsers'].push(loadBasis);

    //     const texture: Texture = await loader.load(`https://pixijs.io/compressed-textures-example/images/kodim20.basis`);

    //     // expect(texture.baseTexture.valid).toBe(true);
    //     // expect(texture.width).toBe(1000);
    //     // expect(texture.height).toBe(664);
    // });
});
