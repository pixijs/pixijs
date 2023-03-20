/**
 * Update the *dependencies in the package.json
 * @param dependencies - Dependencies map
 * @param version - Version to bump to
 */
export function bumpDependencies(dependencies: Record<string, string> = {}, version: string)
{
    Object.keys(dependencies)
        // Only consider bumping monorepo packages
        .filter((n) => dependencies[n].startsWith('file:'))
        .forEach((n) =>
        {
            // replace with exact version
            dependencies[n] = version;
        });
}
