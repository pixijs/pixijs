/**
 * The urls for the Basis transcoder files.
 * These can be set to custom paths if needed.
 * @category assets
 * @advanced
 */
export const basisTranscoderUrls = {
    jsUrl: 'https://files.pixijs.download/transcoders/basis/basis_transcoder.js',
    wasmUrl: 'https://files.pixijs.download/transcoders/basis/basis_transcoder.wasm',
};

/**
 * Sets the Basis transcoder paths.
 * This allows you to override the default paths for the Basis transcoder files.
 * @param config - The configuration object containing the new paths.
 * @category assets
 * @advanced
 */
export function setBasisTranscoderPath(config: Partial<typeof basisTranscoderUrls>)
{
    Object.assign(basisTranscoderUrls, config);
}
