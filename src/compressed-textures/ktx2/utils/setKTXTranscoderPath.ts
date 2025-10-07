/**
 * The urls for the KTX transcoder library.
 * These can be set to custom paths if needed.
 * @category assets
 * @advanced
 */
export const ktxTranscoderUrls = {
    jsUrl: 'https://files.pixijs.download/transcoders/ktx/libktx.js',
    wasmUrl: 'https://files.pixijs.download/transcoders/ktx/libktx.wasm'
};

/**
 * Sets the paths for the KTX transcoder library.
 * @param config - Partial configuration object to set custom paths for the KTX transcoder.
 * This allows you to override the default URLs for the KTX transcoder library.
 * @category assets
 * @advanced
 */
export function setKTXTranscoderPath(config: Partial<typeof ktxTranscoderUrls>)
{
    Object.assign(ktxTranscoderUrls, config);
}
