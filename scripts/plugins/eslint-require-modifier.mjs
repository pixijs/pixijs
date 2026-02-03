/* eslint-disable max-len */
import { getJSDocComment } from '@es-joy/jsdoccomment';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://your-url-here.com/docs/${name}`);

const hiddenTags = ['@hidden', '@internal', '@ignore', '@private'];

const requireMemberApiDocRule = createRule({
    name: 'require-member-api-doc',
    meta: {
        type: 'problem',
        docs: {
            description: 'Require @standard or @advanced JSDoc tags for public class members',
        },
        messages: {
            missingApiDoc: 'Public members must have either @standard or @advanced JSDoc tag',
            missingJSDoc: 'Public members must have JSDoc comments',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context)
    {
        function getComment(node)
        {
            const jsdoc = getJSDocComment(context.sourceCode, node, {
                maxLines: Number(context.settings.jsdoc?.maxLines ?? 1),
                minLines: Number(context.settings.jsdoc?.minLines ?? 0),
            });

            return jsdoc?.value ?? '';
        }
        function isClassInternal(node)
        {
            // Base case - if no node, return false
            if (!node) return false;

            // Check current node's JSDoc
            const jsdoc = getComment(node);

            if (hiddenTags.some((tag) => jsdoc.includes(tag)))
            {
                return true;
            }

            // Recursively check parent nodes
            if (node.parent)
            {
                return isClassInternal(node.parent);
            }

            return false;
        }
        function isClassStandardOrAdvanced(node)
        {
            // Base case - if no node, return false
            if (!node) return false;

            // Check current node's JSDoc
            const jsdoc = getComment(node);

            if (jsdoc.includes('@standard') || jsdoc.includes('@advanced'))
            {
                return true;
            }

            // Recursively check parent nodes
            if (node.parent)
            {
                return isClassStandardOrAdvanced(node.parent);
            }

            return false;
        }
        function isExported(node)
        {
            // Check if the node is exported
            if (node.exportKind && node.exportKind !== 'value')
            {
                return true;
            }

            // If the node has a parent, check if it's exported
            if (node.parent)
            {
                return isExported(node.parent);
            }

            return false;
        }

        /**
         * @param {import('@typescript-eslint/types').TSESTree.MethodDefinition | import('@typescript-eslint/types').TSESTree.PropertyDefinition | import('@typescript-eslint/types').TSESTree.TSMethodSignature | import('@typescript-eslint/types').TSESTree.TSPropertySignature} node
         */
        function checkMemberJSDoc(node)
        {
            // skip if the node is not exported
            if (
                (node.type === 'TSInterfaceDeclaration'
                    || node.type === 'TSTypeAliasDeclaration'
                    || node.type === 'TSDeclareFunction'
                    || node.type === 'TSDeclareMethod'
                    || node.type === 'TSModuleDeclaration'
                    || node.type === 'TSImportEqualsDeclaration'
                    || node.type === 'TSExportAssignment'
                    || node.type === 'TSExportDeclaration'
                    || node.type === 'TSInterfaceBody'
                    || node.type === 'TSPropertySignature'
                    || node.type === 'TSMethodSignature'
                    || node.type === 'TSParameterProperty'
                    || node.type === 'TSAbstractMethodDefinition')
                && !isExported(node)
            )
            {
                return;
            }
            // Skip if the member is not public or class is internal
            if (
                (node.accessibility !== 'public' && node.accessibility !== undefined)
                || isClassInternal(node)
                || hiddenTags.some((tag) => getComment(node).includes(tag))
                || node.kind === 'constructor'
                || isClassStandardOrAdvanced(node)
                || node.type === 'TSParameterProperty'
                // || node.type === 'TSPropertySignature'
            )
            {
                return;
            }

            const jsdoc = getJSDocComment(context.sourceCode, node, {
                maxLines: Number(context.settings.jsdoc?.maxLines ?? 1),
                minLines: Number(context.settings.jsdoc?.minLines ?? 0),
            });

            if (!jsdoc)
            {
                context.report({
                    node,
                    messageId: 'missingJSDoc',
                });

                return;
            }

            const hasApiTag = jsdoc.value.includes('@standard') || jsdoc.value.includes('@advanced');

            if (!hasApiTag)
            {
                context.report({
                    node,
                    messageId: 'missingApiDoc',
                });
            }
        }

        return {
            MethodDefinition(node)
            {
                checkMemberJSDoc(node);
            },
            PropertyDefinition(node)
            {
                checkMemberJSDoc(node);
            },
            TSMethodSignature(node)
            {
                checkMemberJSDoc(node);
            },
            TSPropertySignature(node)
            {
                checkMemberJSDoc(node);
            },
            VariableDeclaration(node)
            {
                const isExportedVar = node.parent?.type === 'ExportNamedDeclaration';

                if (!isExportedVar) return;
                checkMemberJSDoc(node);
            },
            TSTypeAliasDeclaration(node)
            {
                const isExportedVar = node.parent?.type === 'ExportNamedDeclaration';

                if (!isExportedVar) return;
                checkMemberJSDoc(node);
            },
            TSInterfaceDeclaration(node)
            {
                const isExportedVar = node.parent?.type === 'ExportNamedDeclaration';

                if (!isExportedVar) return;
                checkMemberJSDoc(node);
            },
            TSEnumDeclaration(node)
            {
                const isExportedVar = node.parent?.type === 'ExportNamedDeclaration';

                if (!isExportedVar) return;
                checkMemberJSDoc(node);
            },
            FunctionDeclaration(node)
            {
                const isExportedVar = node.parent?.type === 'ExportNamedDeclaration';

                if (!isExportedVar) return;
                checkMemberJSDoc(node);
            }
        };
    },
});

const plugin = {
    meta: {
        name: 'eslint-plugin-require-modifier',
        version: '1.0.0',
    },
    configs: {},
    rules: {
        'require-member-api-doc': requireMemberApiDocRule,
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
