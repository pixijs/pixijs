import { isMobile } from './isMobile';

/**
 * The maximum recommended texture units to use.
 * In theory the bigger the better, and for desktop we'll use as many as we can.
 * But some mobile devices slow down if there is to many branches in the shader.
 * So in practice there seems to be a sweet spot size that varies depending on the device.
 *
 * In v4, all mobile devices were limited to 4 texture units because for this.
 * In v5, we allow all texture units to be used on modern Apple or Android devices.
 *
 * @private
 * @param {number} max
 * @returns {number}
 */
export function maxRecommendedTextures(max: number): number
{
    let allowMax = true;

    if (isMobile.tablet || isMobile.phone)
    {
        if (isMobile.apple.device)
        {
            const match = (navigator.userAgent).match(/OS (\d+)_(\d+)?/);

            if (match)
            {
                const majorVersion = parseInt(match[1], 10);

                // Limit texture units on devices below iOS 11, which will be older hardware
                if (majorVersion < 11)
                {
                    allowMax = false;
                }
            }
        }
        if (isMobile.android.device)
        {
            const match = (navigator.userAgent).match(/Android\s([0-9.]*)/);

            if (match)
            {
                const majorVersion = parseInt(match[1], 10);

                // Limit texture units on devices below Android 7 (Nougat), which will be older hardware
                if (majorVersion < 7)
                {
                    allowMax = false;
                }
            }
        }
    }

    return allowMax ? max : 4;
}
