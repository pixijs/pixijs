export const environment = {
    browser: typeof window === 'object',
    webworker: typeof importScripts === 'function',
    node: typeof process === 'object',
};
