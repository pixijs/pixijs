import { isMobile } from '@pixi/settings';

/**
 * Uploading the same buffer multiple times in a single frame can cause performance issues.
 * Apparent on iOS so only check for that at the moment
 * This check may become more complex if this issue pops up elsewhere.
 * @private
 * @returns {boolean} `true` if the same buffer may be uploaded more than once.
 */
export function canUploadSameBuffer(): boolean
{
    return !isMobile.apple.device;
}
