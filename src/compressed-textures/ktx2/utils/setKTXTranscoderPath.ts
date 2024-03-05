export const ktxTranscoderUrls = {
    jsUrl: 'https://files.pixijs.download/transcoders/ktx/libktx.js',
    wasmUrl: 'https://files.pixijs.download/transcoders/ktx/libktx.wasm'
};

export function setKTXTranscoderPath(config: Partial<typeof ktxTranscoderUrls>)
{
    Object.assign(ktxTranscoderUrls, config);
}
