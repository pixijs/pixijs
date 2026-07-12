export const itLocalOnly = !process.env.GITHUB_ACTIONS ? it : it.skip;
export const describeLocalOnly = !process.env.GITHUB_ACTIONS ? describe : describe.skip;
