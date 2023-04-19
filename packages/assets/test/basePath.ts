export const basePath = process.env.GITHUB_ACTIONS
    ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/assets/test/assets/`
    : 'http://localhost:8080/assets/test/assets/';
