export function migrateFragmentFromV7toV8(fragmentShader: string): string
{
    fragmentShader = fragmentShader
        .replaceAll('texture2D', 'texture')
        .replaceAll('gl_FragColor', 'finalColor')
        .replaceAll('varying', 'in');

    fragmentShader = `
        out vec4 finalColor;
    ${fragmentShader}
    `;

    return fragmentShader;
}
