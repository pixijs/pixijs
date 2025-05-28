import isMobileJs from 'ismobilejs';

// ismobilejs have different import behavior for CJS and ESM, so here is the hack
type isMobileJsType = typeof isMobileJs & { default?: typeof isMobileJs };
const isMobileCall = (isMobileJs as isMobileJsType).default ?? isMobileJs;

/**
 * The result of the {@link isMobile} function.
 * @category utils
 * @standard
 */
export type isMobileResult = {
    /** Whether the device is an Apple device. */
    apple: {
        phone: boolean;
        ipod: boolean;
        tablet: boolean;
        universal: boolean;
        device: boolean;
    };
    /** Whether the device is an Amazon device. */
    amazon: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    /** Whether the device is an Android device. */
    android: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    /** Whether the device is a Windows device. */
    windows: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    /** Whether the device is a specific device. */
    other: {
        blackberry: boolean;
        blackberry10: boolean;
        opera: boolean;
        firefox: boolean;
        chrome: boolean;
        device: boolean;
    };
    /** Whether the device is a phone device. */
    phone: boolean;
    /** Whether the device is a tablet device. */
    tablet: boolean;
    /** Whether the device is any kind of device. */
    any: boolean;
};

/**
 * Detects whether the device is mobile and what type of mobile device it is.
 * ```js
 * import { isMobile } from 'pixi.js';
 *
 * if (isMobile.apple.tablet) {
 *    // The device is an Apple tablet device.
 * }
 * ```
 * @category utils
 * @standard
 */
export const isMobile: isMobileResult = isMobileCall(globalThis.navigator);
