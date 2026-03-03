import path from 'path';

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require ~/ imports for source code in .test.ts and .scene.ts files',
        },
        fixable: 'code',
        messages: {
            useAliasImport:
                'Use \'~/{{ replacement }}\' instead of relative import \'{{ original }}\'. '
                + 'Test and scene files should use ~/ paths for source imports.',
        },
        schema: [],
    },
    create(context)
    {
        const filename = context.filename ?? context.getFilename();

        if (!filename.endsWith('.test.ts') && !filename.endsWith('.scene.ts'))
        {
            return {};
        }

        const cwd = context.cwd ?? context.getCwd?.() ?? process.cwd();
        const srcDir = path.join(cwd, 'src');

        function checkImport(node)
        {
            const source = node.source;

            if (!source) return;

            const importPath = source.value;

            if (!importPath.startsWith('.')) return;

            const fileDir = path.dirname(filename);
            const resolvedPath = path.resolve(fileDir, importPath);

            if (!resolvedPath.startsWith(srcDir + path.sep) && resolvedPath !== srcDir)
            {
                return;
            }

            const relativeToSrc = path.relative(srcDir, resolvedPath).split(path.sep).join('/');

            // In .test.ts files, allow relative imports within the same top-level src/ folder
            if (filename.endsWith('.test.ts'))
            {
                const fileRelativeToSrc = path.relative(srcDir, filename).split(path.sep).join('/');
                const fileTopLevel = fileRelativeToSrc.split('/')[0];
                const importTopLevel = relativeToSrc.split('/')[0];

                if (fileTopLevel === importTopLevel)
                {
                    return;
                }
            }

            const replacement = relativeToSrc.split('/')[0];

            context.report({
                node: source,
                messageId: 'useAliasImport',
                data: {
                    replacement,
                    original: importPath,
                },
                fix(fixer)
                {
                    const quote = source.raw?.[0] ?? '\'';

                    return fixer.replaceText(source, `${quote}~/${replacement}${quote}`);
                },
            });
        }

        return {
            ImportDeclaration: checkImport,
            ExportNamedDeclaration: checkImport,
            ExportAllDeclaration: checkImport,
        };
    },
};

const plugin = {
    meta: {
        name: 'eslint-plugin-require-tilde-imports',
        version: '1.0.0',
    },
    configs: {},
    rules: {
        'require-tilde-imports': rule,
    },
    processors: {},
};

export default plugin;
