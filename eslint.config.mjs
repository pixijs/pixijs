import pluginJest from 'eslint-plugin-jest';
import jsdoc from 'eslint-plugin-jsdoc';
import noMixed from 'eslint-plugin-no-mixed-operators';
import tseslint from 'typescript-eslint';
import config from '@pixi/eslint-config';

export default tseslint.config(
    ...config,
    {
        ignores: ['.s3_uploads', 'out', 'docs', 'dist', 'lib', 'transcoders', 'node_modules', 'src/*/**/index.ts'],
    },
    {
        files: ['**/*'],
        plugins: {
            jsdoc,
            'no-mixed-operators': noMixed,
        },
        settings: {
            jsdoc: {
                tagNamePreference: {
                    method: 'method',
                    function: 'function',
                    extends: 'extends',
                    typeParam: 'typeParam',
                    api: 'api',
                },
            },
        },
        rules: {
            'no-mixed-operators': 'off',
            'no-mixed-operators/no-mixed-operators': 1,

            'jsdoc/multiline-blocks': [1, { noMultilineBlocks: true, minimumLengthForMultiline: 115 }],
            'jsdoc/check-access': 1,
            'jsdoc/check-alignment': 1,
            'jsdoc/check-param-names': 1,
            'jsdoc/check-property-names': 1,
            'jsdoc/check-tag-names': 1,
            'jsdoc/check-types': 1,
            'jsdoc/check-values': 1,
            'jsdoc/empty-tags': 1,
            'jsdoc/implements-on-classes': 1,
            'jsdoc/tag-lines': 1,
            'jsdoc/no-multi-asterisks': [1, { allowWhitespace: true }],
            'jsdoc/require-param': 1,
            'jsdoc/require-param-description': 0,
            'jsdoc/require-param-name': 1,
            'jsdoc/require-param-type': ['warn', { contexts: ['TSMethodSignature'] }],
            'jsdoc/require-property': 1,
            'jsdoc/require-property-description': 1,
            'jsdoc/require-property-name': 1,
            'jsdoc/require-property-type': 1,
            'jsdoc/require-returns-description': 1,
            'jsdoc/require-hyphen-before-param-description': 1,
            'jsdoc/valid-types': 1,
        },
    },
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
            '@typescript-eslint/triple-slash-reference': [1, { path: 'always' }],
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'explicit',
                    overrides: {
                        accessors: 'off',
                        constructors: 'no-public',
                        methods: 'explicit',
                        properties: 'explicit',
                        parameterProperties: 'explicit',
                    },
                },
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'memberLike',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    leadingUnderscore: 'require',
                },
            ],
            '@typescript-eslint/no-unsafe-declaration-merging': 0,
            '@typescript-eslint/no-duplicate-enum-values': 0,
        },
    },
    {
        // update this to match your test files
        files: ['**/*.test.ts'],
        plugins: { jest: pluginJest },
        languageOptions: {
            globals: pluginJest.environments.globals.globals,
        },
        rules: {
            ...pluginJest.configs['flat/recommended'].rules,
            '@typescript-eslint/explicit-member-accessibility': 0,
            '@typescript-eslint/no-unused-expressions': 0,
            '@typescript-eslint/dot-notation': [
                0,
                {
                    allowPrivateClassPropertyAccess: true,
                    allowProtectedClassPropertyAccess: true,
                    allowIndexSignaturePropertyAccess: true,
                },
            ],
            'dot-notation': 0,
            'jest/no-conditional-expect': 'off',
            'jest/no-standalone-expect': 'off',
            'jest/expect-expect': [
                'error',
                {
                    assertFunctionNames: ['expect', 'check32BitColorMatches', 'assertRemovedFromParent'],
                    additionalTestBlockFunctions: [''],
                },
            ],
        },
    },
);
