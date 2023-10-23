export const basisTranscoderUrls = {
    jsUrl: 'https://files.pixijs.download/transcoders/basis/basis_transcoder.js',
    wasmUrl: 'https://files.pixijs.download/transcoders/basis/basis_transcoder.wasm',
};

export function setBasisTranscoderPath(config: Partial<typeof basisTranscoderUrls>)
{
    Object.assign(basisTranscoderUrls, config);
}
