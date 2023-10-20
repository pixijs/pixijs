export const ktxTranscoderUrls = {
    jsUrl: './ktx/libktx.js',
    wasmUrl: './ktx/libktx.wasm'
};

export function setKTXTranscoderPath(config: Partial<typeof ktxTranscoderUrls>)
{
    Object.assign(ktxTranscoderUrls, config);
}
