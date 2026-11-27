/* eslint-disable camelcase -- GitHub's REST parameters are snake_case */
const TYPES = ['feat', 'fix', 'chore', 'breaking', 'build', 'ci', 'docs', 'perf', 'refactor', 'revert', 'style', 'test'];
const TITLE_REGEX = new RegExp(`^(${TYPES.join('|')})(\\([^()]+\\))?!?: \\S`);
const MARKER = '<!-- pr-title-check -->';
const WARNING = [
    MARKER,
    ':warning: This PR title doesn\'t follow the [Conventional Commits](https://www.conventionalcommits.org/) format.',
    '',
    `Use \`type(scope)!: description\`. The scope and \`!\` are optional, and the type is one of: ${
        TYPES.map((type) => `\`${type}\``).join(', ')}.`,
    '',
    '```',
    'feat: add new feature to Text',
    'fix(text): text not rendering',
    'chore: update Text docs',
    'breaking: remove Text#resolution',
    '```',
].join('\n');

/**
 * Fails the check when the PR title isn't a Conventional Commits title. On PRs opened from this repo, it also
 * keeps one bot comment explaining the format, shown while the title is invalid and minimized once it's fixed.
 * Fork PRs only get the failed check, because their token can't write comments.
 * @param {object} args - the arguments actions/github-script passes to a script
 * @param {object} args.github - an authenticated Octokit client
 * @param {object} args.context - the workflow run context
 * @param {object} args.core - the @actions/core toolkit
 */
export default async function checkPrTitle({ github, context, core })
{
    const pr = context.payload.pull_request;
    const isValid = TITLE_REGEX.test(pr.title);

    if (pr.head.repo?.full_name === pr.base.repo.full_name)
    {
        await syncComment({ github, context, core }, isValid);
    }

    if (!isValid)
    {
        core.setFailed(`PR title must look like "type(scope)!: description", where type is one of: ${TYPES.join(', ')}.`);
    }
}

async function syncComment({ github, context, core }, isValid)
{
    const { owner, repo } = context.repo;
    const issue_number = context.issue.number;
    const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number, per_page: 100 });
    const [comment, ...duplicates] = comments.filter((c) =>
        c.user?.login === 'github-actions[bot]' && c.body?.includes(MARKER));

    // Overlapping runs can each post a comment before seeing the other's.
    for (const duplicate of duplicates)
    {
        await setMinimized({ github, core }, duplicate.node_id, true);
    }

    if (isValid)
    {
        if (comment) await setMinimized({ github, core }, comment.node_id, true);

        return;
    }

    if (!comment)
    {
        await github.rest.issues.createComment({ owner, repo, issue_number, body: WARNING });

        return;
    }

    if (comment.body !== WARNING)
    {
        await github.rest.issues.updateComment({ owner, repo, comment_id: comment.id, body: WARNING });
    }

    await setMinimized({ github, core }, comment.node_id, false);
}

async function setMinimized({ github, core }, nodeId, minimized)
{
    const mutation = minimized
        ? `mutation($id: ID!) {
            minimizeComment(input: { subjectId: $id, classifier: OUTDATED }) { minimizedComment { isMinimized } }
        }`
        : `mutation($id: ID!) {
            unminimizeComment(input: { subjectId: $id }) { unminimizedComment { isMinimized } }
        }`;

    // Hiding or showing the comment is cosmetic, so a failure here shouldn't fail the title check.
    try
    {
        await github.graphql(mutation, { id: nodeId });
    }
    catch (error)
    {
        core.info(`Could not ${minimized ? 'minimize' : 'unminimize'} comment ${nodeId}: ${error.message}`);
    }
}
