import isMobileJs from 'ismobilejs';

// ismobilejs have different import behavior for CJS and ESM, so here is the hack
type isMobileJsType = typeof isMobileJs & { default?: typeof isMobileJs };
const isMobileCall = (isMobileJs as isMobileJsType).default ?? isMobileJs;

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

export const isMobile: isMobileResult = isMobileCall(globalThis.navigator);
