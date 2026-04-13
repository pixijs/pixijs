/* eslint-disable max-len */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Comment, ReflectionKind, RendererEvent } from 'typedoc';

const HEADER = `# PixiJS

> PixiJS is the fastest, most lightweight 2D library available for the web, working across all devices and allowing you to create rich, interactive graphics and cross-platform applications using WebGL, WebGPU, and Canvas as a fallback.
`;

const KEY_KINDS = ReflectionKind.Class | ReflectionKind.Function | ReflectionKind.Variable | ReflectionKind.Document;

/**
 * Returns true if the reflection (or its first signature) has the @advanced modifier tag.
 * @param reflection
 */
function isAdvanced(reflection)
{
    const comment = reflection.comment ?? reflection.signatures?.[0]?.comment;

    return comment?.modifierTags?.has('@advanced') ?? false;
}

/**
 * Extracts a clean, single-sentence description from a reflection.
 * Joins all summary lines, then takes the first sentence (up to the first period
 * followed by whitespace or end-of-string) to avoid mid-sentence truncation.
 * @param reflection
 */
function getDescription(reflection)
{
    // Document reflections store description in frontmatter
    if (reflection.frontmatter?.description)
    {
        return `: ${reflection.frontmatter.description}`;
    }

    const comment = reflection.comment ?? reflection.signatures?.[0]?.comment;

    if (!comment?.summary) return '';

    // Join all lines into one string, collapse whitespace
    const raw = Comment.combineDisplayParts(comment.summary)
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!raw) return '';

    // Extract first sentence (up to first `. ` or `.` at end of string)
    const match = raw.match(/^(.+?\.)\s/);
    const text = match ? match[1] : raw;

    return `: ${text}`;
}

function buildUrlMap(pages)
{
    const map = new Map();

    for (const page of pages)
    {
        if (page.model)
        {
            map.set(page.model, `./${page.url}.md`);
        }
    }

    return map;
}

function formatEntry(reflection, urlMap)
{
    const url = urlMap.get(reflection);

    if (!url) return null;

    const desc = getDescription(reflection);

    return `- [${reflection.name}](${url})${desc}`;
}

function collectDocEntries(reflection, urlMap, entries)
{
    const entry = formatEntry(reflection, urlMap);

    if (!entry) return;

    entries.push(entry);

    // Recurse into children of Document reflections (sub-docs)
    if (reflection.kind & ReflectionKind.Document && reflection.children)
    {
        for (const child of reflection.children)
        {
            collectDocEntries(child, urlMap, entries);
        }
    }
}

function buildLlmsTxt(project, urlMap)
{
    const lines = [HEADER];
    const optionalEntries = [];

    for (const category of project.categories ?? [])
    {
        const standardEntries = [];

        for (const child of category.children)
        {
            if (!(child.kind & KEY_KINDS)) continue;

            // Documents (guides) always go in the main section
            if (child.kind & ReflectionKind.Document)
            {
                collectDocEntries(child, urlMap, standardEntries);
                continue;
            }

            const entry = formatEntry(child, urlMap);

            if (!entry) continue;

            if (isAdvanced(child))
            {
                optionalEntries.push(entry);
            }
            else
            {
                standardEntries.push(entry);
            }
        }

        if (standardEntries.length === 0) continue;

        lines.push(`## ${category.title}\n`);
        lines.push(standardEntries.join('\n'));
        lines.push('');
    }

    // Append optional section for advanced/low-level APIs
    if (optionalEntries.length > 0)
    {
        lines.push(`## Optional\n`);
        lines.push(optionalEntries.join('\n'));
        lines.push('');
    }

    return lines.join('\n');
}

export function load(app)
{
    app.renderer.on(RendererEvent.END, (event) =>
    {
        if (!event.outputDirectory.endsWith('docs')) return;

        const urlMap = buildUrlMap(event.pages);
        const llmsTxt = buildLlmsTxt(event.project, urlMap);

        writeFileSync(join(event.outputDirectory, 'llms.txt'), llmsTxt);
    });
}
