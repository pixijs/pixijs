import isMobileJs from 'ismobilejs';

// ismobilejs have different import behavior for CJS and ESM, so here is the hack
type isMobileJsType = typeof isMobileJs & { default?: typeof isMobileJs };
const isMobileCall = (isMobileJs as isMobileJsType).default ?? isMobileJs;

/**
 * The result of the {@link utils.isMobile} function.
 * @ignore
 * @memberof utils
 */
export type isMobileResult = {
    /**
     * Whether the device is an Apple device.
     * @memberof utils.isMobile
     */
    apple: {
        phone: boolean;
        ipod: boolean;
        tablet: boolean;
        universal: boolean;
        device: boolean;
    };
    /**
     * Whether the device is an Amazon device.
     * @memberof utils.isMobile
     */
    amazon: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    /**
     * Whether the device is an Android device.
     * @memberof utils.isMobile
     */
    android: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    /**
     * Whether the device is a Windows device.
     * @memberof utils.isMobile
     */
    windows: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    /**
     * Whether the device is a specific device.
     * @memberof utils.isMobile
     */
    other: {
        blackberry: boolean;
        blackberry10: boolean;
        opera: boolean;
        firefox: boolean;
        chrome: boolean;
        device: boolean;
    };
    /**
     * Whether the device is a phone device.
     * @memberof utils.isMobile
     */
    phone: boolean;
    /**
     * Whether the device is a tablet device.
     * @memberof utils.isMobile
     */
    tablet: boolean;
    /**
     * Whether the device is any kind of device.
     * @memberof utils.isMobile
     */
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
 * @memberof utils
 */
export const isMobile: isMobileResult = isMobileCall(globalThis.navigator);
