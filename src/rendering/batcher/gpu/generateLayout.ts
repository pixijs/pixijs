export function generateLayout(maxTextures: number): Record<string, number>
{
    const layout: Record<string, number> = {};

    let bindIndex = 0;

    for (let i = 0; i < maxTextures; i++)
    {
        layout[`textureSource${i + 1}`] = bindIndex++;
        layout[`textureSampler${i + 1}`] = bindIndex++;
    }

    return layout;
}
