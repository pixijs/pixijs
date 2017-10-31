import { URL_FILE_EXTENSION } from '../const';

/**
 * Get type of the image by regexp for extension. Returns undefined for unknown extensions.
 *
 * @memberof PIXI.utils
 * @function getUrlFileExtension
 * @param {string} url - the image path
 * @return {string|undefined} image extension
 */
export function getUrlFileExtension(url)
{
    const extension = URL_FILE_EXTENSION.exec(url);

    if (extension)
    {
        return extension[1].toLowerCase();
    }

    return undefined;
}
