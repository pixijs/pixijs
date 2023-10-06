import { Resolver } from '../../assets/resolver/Resolver';

/**
 * get the resolution / device pixel ratio of an asset by looking for the prefix
 * used by spritesheets and image urls
 * @memberof utils
 * @function getResolutionOfUrl
 * @param {string} url - the image path
 * @param {number} [defaultValue=1] - the defaultValue if no filename prefix is set.
 * @returns {number} resolution / device pixel ratio of an asset
 */
export function getResolutionOfUrl(url: string, defaultValue = 1): number
{
    const resolution = Resolver.RETINA_PREFIX?.exec(url);

    if (resolution)
    {
        return parseFloat(resolution[1]);
    }

    return defaultValue;
}
