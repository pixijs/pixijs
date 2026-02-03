import {
    getJSDocComment,
} from '@es-joy/jsdoccomment';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
    (name) => `${name}`,
);

const requireExportJsdocRule = createRule({
    meta: {
        type: 'problem',
        docs: {
            description: 'Require JSDoc comments with specific tags for exported items',
        },
        messages: {
            missingJSDoc: 'Exported items must have JSDoc comments',
            missingRequiredTag: 'JSDoc must include one of these tags: @category, @internal, @ignore, @private',
        },
        schema: [],
    },
    defaultOptions: [],
    name: 'require-export-jsdoc',
    create(context)
    {
        const requiredTags = ['@category', '@internal', '@ignore', '@private'];

        function checkJSDocTags(node, jsdoc)
        {
            if (!jsdoc)
            {
                context.report({
                    node,
                    messageId: 'missingJSDoc',
                });

                return;
            }

            const hasRequiredTag = requiredTags.some((tag) =>
                jsdoc.value.includes(tag)
            );

            if (!hasRequiredTag)
            {
                context.report({
                    node,
                    messageId: 'missingRequiredTag',
                });
            }
        }

        return {
            ExportNamedDeclaration(node)
            {
                if (!node.declaration) return;

                const jsdoc = getJSDocComment(context.sourceCode, node, {
                    maxLines: Number(context.settings.jsdoc?.maxLines ?? 1),
                    minLines: Number(context.settings.jsdoc?.minLines ?? 0),
                });

                checkJSDocTags(node, jsdoc);
            },
            ExportDefaultDeclaration(node)
            {
                // check if the interface is exported
                if (!node.exportKind || node.exportKind === 'value')
                {
                    return;
                }
                const jsdoc = getJSDocComment(context.sourceCode, node, {
                    maxLines: Number(context.settings.jsdoc?.maxLines ?? 1),
                    minLines: Number(context.settings.jsdoc?.minLines ?? 0),
                });

                checkJSDocTags(node, jsdoc);
            },
            TSInterfaceDeclaration(node)
            {
                // check if the interface is exported
                if (!node.exportKind || node.exportKind === 'value')
                {
                    return;
                }
                const jsdoc = getJSDocComment(context.sourceCode, node, {
                    maxLines: Number(context.settings.jsdoc?.maxLines ?? 1),
                    minLines: Number(context.settings.jsdoc?.minLines ?? 0),
                });

                checkJSDocTags(node, jsdoc);
            },
            TSTypeAliasDeclaration(node)
            {
                // check if the interface is exported
                if (!node.exportKind || node.exportKind === 'value')
                {
                    return;
                }

                const jsdoc = getJSDocComment(context.sourceCode, node, {
                    maxLines: Number(context.settings.jsdoc?.maxLines ?? 1),
                    minLines: Number(context.settings.jsdoc?.minLines ?? 0),
                });

                checkJSDocTags(node, jsdoc);
            },
        };
    },
});

const plugin = {
    meta: {
        name: 'eslint-plugin-require-export',
        version: '1.0.0',
    },
    configs: {},
    rules: {
        'require-export-jsdoc': requireExportJsdocRule,
    },
    processors: {},
};

/**
 * An eslint plugin that enforces JSDoc comments for exported items.
 * It checks for the presence of JSDoc comments and ensures that at least one of the specified tags
 * (@category, @internal, @ignore, @private) is included in the JSDoc comment.
 * If the JSDoc comment is missing or does not contain any of the required tags, it reports an error.
 * This rule is useful for maintaining consistent documentation standards in codebases.
 */
export default plugin;
