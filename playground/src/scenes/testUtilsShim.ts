// Browser-compatible shim for @test-utils used by some visual test scenes.
// In the playground, assets are served via /test-utils-assets/ middleware.
export const basePath = '/test-utils-assets/';
export const isCI = false;

export function getAsset(file: string): string
{
    return basePath + file;
}
