import { settings } from '@pixi/settings';

/**
 * If set to `true`, {@link PIXI.KTXLoader} will parse key-value data in KTX textures. This feature relies
 * on the [Encoding Standard]{@link https://encoding.spec.whatwg.org}.
 *
 * The key-value data will be available on the base-textures as {@code ktxKvData}. They will hold a reference
 * to the texture data buffer, so make sure to delete key-value data once you are done using it.
 */
settings.KTX_LOAD_KV_DATA = false;
