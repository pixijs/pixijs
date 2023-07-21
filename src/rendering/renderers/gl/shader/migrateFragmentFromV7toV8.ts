export function migrateFragmentFromV7toV8(fragmentShader: string): string
{
    fragmentShader = fragmentShader
        .replaceAll('texture2D', 'texture')
        .replaceAll('gl_FragColor', 'fragColor')
        .replaceAll('varying', 'in');

    fragmentShader = `
        out vec4 fragColor;
    ${fragmentShader}
    `;

    return fragmentShader;
}
