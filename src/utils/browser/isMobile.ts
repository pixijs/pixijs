import isMobileJs from 'ismobilejs';

// ismobilejs have different import behavior for CJS and ESM, so here is the hack
type isMobileJsType = typeof isMobileJs & { default?: typeof isMobileJs };
const isMobileCall = (isMobileJs as isMobileJsType).default ?? isMobileJs;

/**
 * The result of the mobile device detection system.
 * Provides detailed information about device type and platform.
 * @example
 * ```ts
 * // Type usage with isMobile
 * const deviceInfo: isMobileResult = isMobile;
 *
 * // Check device categories
 * if (deviceInfo.apple.device) {
 *     console.log('iOS Device Details:', {
 *         isPhone: deviceInfo.apple.phone,
 *         isTablet: deviceInfo.apple.tablet,
 *         isUniversal: deviceInfo.apple.universal
 *     });
 * }
 *
 * // Platform-specific checks
 * const platformInfo = {
 *     isApple: deviceInfo.apple.device,
 *     isAndroid: deviceInfo.android.device,
 *     isAmazon: deviceInfo.amazon.device,
 *     isWindows: deviceInfo.windows.device
 * };
 * ```
 * @category utils
 * @standard
 */
export type isMobileResult = {
    /**
     * Apple device detection information.
     * Provides detailed iOS device categorization.
     * @example
     * ```ts
     * // iOS device checks
     * if (isMobile.apple.device) {
     *     if (isMobile.apple.tablet) {
     *         // iPad-specific code
     *         useTabletLayout();
     *     } else if (isMobile.apple.phone) {
     *         // iPhone-specific code
     *         usePhoneLayout();
     *     }
     * }
     * ```
     */
    apple: {
        /** Whether the device is an iPhone */
        phone: boolean;
        /** Whether the device is an iPod Touch */
        ipod: boolean;
        /** Whether the device is an iPad */
        tablet: boolean;
        /** Whether app is running in iOS universal mode */
        universal: boolean;
        /** Whether device is any Apple mobile device */
        device: boolean;
    };

    /**
     * Amazon device detection information.
     * Identifies Amazon Fire tablets and phones.
     * @example
     * ```ts
     * // Amazon Fire tablet detection
     * if (isMobile.amazon.tablet) {
     *     // Fire tablet optimizations
     *     optimizeForFireTablet();
     * }
     * ```
     */
    amazon: {
        /** Whether device is a Fire Phone */
        phone: boolean;
        /** Whether device is a Fire Tablet */
        tablet: boolean;
        /** Whether device is any Amazon mobile device */
        device: boolean;
    };

    /**
     * Android device detection information.
     * Categorizes Android phones and tablets.
     * @example
     * ```ts
     * // Android device handling
     * if (isMobile.android.device) {
     *     // Check specific type
     *     const deviceType = isMobile.android.tablet ?
     *         'tablet' : 'phone';
     *     console.log(`Android ${deviceType} detected`);
     * }
     * ```
     */
    android: {
        /** Whether device is an Android phone */
        phone: boolean;
        /** Whether device is an Android tablet */
        tablet: boolean;
        /** Whether device is any Android device */
        device: boolean;
    };

    /**
     * Windows device detection information.
     * Identifies Windows phones and tablets.
     * @example
     * ```ts
     * // Windows device checks
     * if (isMobile.windows.tablet) {
     *     // Surface tablet optimizations
     *     enableTouchFeatures();
     * }
     * ```
     */
    windows: {
        /** Whether device is a Windows Phone */
        phone: boolean;
        /** Whether device is a Windows tablet */
        tablet: boolean;
        /** Whether device is any Windows mobile device */
        device: boolean;
    };

    /**
     * Other device detection information.
     * Covers additional platforms and browsers.
     * @example
     * ```ts
     * // Check other platforms
     * if (isMobile.other.blackberry10) {
     *     // BlackBerry 10 specific code
     * } else if (isMobile.other.chrome) {
     *     // Chrome mobile specific code
     * }
     * ```
     */
    other: {
        /** Whether device is a BlackBerry */
        blackberry: boolean;
        /** Whether device is a BlackBerry 10 */
        blackberry10: boolean;
        /** Whether browser is Opera Mobile */
        opera: boolean;
        /** Whether browser is Firefox Mobile */
        firefox: boolean;
        /** Whether browser is Chrome Mobile */
        chrome: boolean;
        /** Whether device is any other mobile device */
        device: boolean;
    };

    /**
     * Whether the device is any type of phone.
     * Combines detection across all platforms.
     * @example
     * ```ts
     * // Check if device is a phone
     * if (isMobile.phone) {
     *     console.log('Running on a mobile phone');
     * }
     * ```
     */
    phone: boolean;

    /**
     * Whether the device is any type of tablet.
     * Combines detection across all platforms.
     * @example
     * ```ts
     * // Check if device is a tablet
     * if (isMobile.tablet) {
     *     console.log('Running on a mobile tablet');
     * }
     * ```
     */
    tablet: boolean;

    /**
     * Whether the device is any type of mobile device.
     * True if any mobile platform is detected.
     * @example
     * ```ts
     * // Check if device is mobile
     * if (isMobile.any) {
     *     console.log('Running on a mobile device');
     * }
     * ```
     */
    any: boolean;
};

/**
 * Detects whether the device is mobile and what type of mobile device it is.
 * Provides a comprehensive detection system for mobile platforms and devices.
 * @example
 * ```ts
 * import { isMobile } from 'pixi.js';
 *
 * // Check specific device types
 * if (isMobile.apple.tablet) {
 *    console.log('Running on iPad');
 * }
 *
 * // Check platform categories
 * if (isMobile.android.any) {
 *    console.log('Running on Android');
 * }
 *
 * // Conditional rendering
 * if (isMobile.phone) {
 *    renderer.resolution = 2;
 *    view.style.width = '100vw';
 * }
 * ```
 * @remarks
 * - Detects all major mobile platforms
 * - Distinguishes between phones and tablets
 * - Updates when navigator changes
 * - Common in responsive design
 * @category utils
 * @standard
 * @see {@link isMobileResult} For full type definition
 */
export const isMobile: isMobileResult = isMobileCall(globalThis.navigator);
