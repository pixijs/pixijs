// The ESM/CJS versions of ismobilejs only
// exports the function for executing
// designed for Node-only environments
import isMobileCall from 'ismobilejs';

const isMobile = isMobileCall(window.navigator);

export { isMobile };
