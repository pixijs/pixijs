export const isCI = process.env.GITHUB_ACTIONS === 'true';
const GITHUB_SHA = (process.env.GITHUB_SHA || 'master');

export const basePath = isCI
    ? `https://raw.githubusercontent.com/pixijs/pixijs/${GITHUB_SHA}/tests/utils/assets/`
    : 'http://127.0.0.1:8080/tests/utils/assets/';

export function getAsset(file: string)
{
    return basePath + file;
}
