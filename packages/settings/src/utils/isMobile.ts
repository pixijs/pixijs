// The ESM/CJS versions of ismobilejs only
// exports the function for executing
// designed for Node-only environments
import isMobileCall from 'ismobilejs';
import type { isMobileResult } from 'ismobilejs';

const isMobile: isMobileResult = isMobileCall(globalThis.navigator);

export { isMobile };
