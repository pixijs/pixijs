import isMobileJs from 'ismobilejs';

// ismobilejs have different import behavior for CJS and ESM, so here is the hack
type isMobileJsType = typeof isMobileJs & { default?: typeof isMobileJs };
const isMobileCall = (isMobileJs as isMobileJsType).default ?? isMobileJs;

/**
 * The result of the {@link utils.isMobile} function.
 * @memberof utils
 */
export type isMobileResult = {
    apple: {
        phone: boolean;
        ipod: boolean;
        tablet: boolean;
        universal: boolean;
        device: boolean;
    };
    amazon: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    android: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    windows: {
        phone: boolean;
        tablet: boolean;
        device: boolean;
    };
    other: {
        blackberry: boolean;
        blackberry10: boolean;
        opera: boolean;
        firefox: boolean;
        chrome: boolean;
        device: boolean;
    };
    phone: boolean;
    tablet: boolean;
    any: boolean;
};

/**
 * Detects whether the device is mobile and what type of mobile device it is.
 * @memberof utils
 */
export const isMobile: isMobileResult = isMobileCall(globalThis.navigator);
