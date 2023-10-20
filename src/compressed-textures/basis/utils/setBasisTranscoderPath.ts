export const basisTranscoderUrls = {
    jsUrl: './basis/basis_transcoder.js',
    wasmUrl: './basis/basis_transcoder.wasm'
};

export function setBasisTranscoderPath(config: Partial<typeof basisTranscoderUrls>)
{
    Object.assign(basisTranscoderUrls, config);
}
