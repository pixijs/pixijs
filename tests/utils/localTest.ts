export const itLocalOnly = !process.env.GITHUB_ACTIONS ? it : it.skip;
