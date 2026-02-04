export const isCI = process.env.GITHUB_ACTIONS === 'true';
const GITHUB_SHA = (process.env.GITHUB_SHA || 'master');

const serverPort = process.env.SERVER_PORT || '8080';

export const basePath = isCI
    ? `https://raw.githubusercontent.com/pixijs/pixijs/${GITHUB_SHA}/tests/utils/assets/`
    : `http://127.0.0.1:${serverPort}/tests/utils/assets/`;

export function getAsset(file: string)
{
    return basePath + file;
}
