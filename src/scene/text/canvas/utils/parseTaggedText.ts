import type { TextStyle, TextStyleOptions } from '../../TextStyle';

/**
 * Represents a run of text with a specific style.
 * Used internally for tagged text rendering.
 * @internal
 */
export interface TextStyleRun
{
    /** The text content of this run */
    text: string;
    /** The computed style for this run (base style merged with tag overrides) */
    style: TextStyle;
}

/**
 * Checks whether the given style has tagStyles defined with at least one entry.
 * @param style - The TextStyle to check
 * @returns True if tagStyles is defined and has entries
 * @internal
 */
export function hasTagStyles(style: TextStyle): boolean
{
    return !!style.tagStyles && Object.keys(style.tagStyles).length > 0;
}

/**
 * Checks whether the text contains potential tag markup.
 * This is a quick check before attempting to parse.
 * @param text - The text to check
 * @returns True if text contains '<' character
 * @internal
 */
export function hasTagMarkup(text: string): boolean
{
    return text.includes('<');
}

/**
 * Creates a merged TextStyle from a base style and tag style overrides.
 * @param baseStyle - The base TextStyle
 * @param overrides - Style overrides from the tag
 * @returns A new TextStyle with merged properties
 * @internal
 */
function createMergedStyle(baseStyle: TextStyle, overrides: TextStyleOptions): TextStyle
{
    return baseStyle.clone().assign(overrides);
}

/**
 * Parses text with tag markup into an array of styled runs.
 * Supports simple open/close tags like `<red>text</red>`.
 * Nested tags are supported via a stack - inner tags inherit from outer tags.
 * Unknown tags (not in tagStyles) are treated as literal text.
 * @param text - The text to parse
 * @param style - The base TextStyle containing tagStyles
 * @returns Array of TextStyleRun objects
 * @internal
 */
export function parseTaggedText(text: string, style: TextStyle): TextStyleRun[]
{
    const runs: TextStyleRun[] = [];
    const tagStyles = style.tagStyles;

    // If no tagStyles or no potential tags, return single run with base style
    if (!hasTagStyles(style) || !hasTagMarkup(text))
    {
        runs.push({ text, style });

        return runs;
    }

    // Stack of active styles (for nested tags)
    const styleStack: TextStyle[] = [style];
    // Stack of active tag names (to match closing tags)
    const tagStack: string[] = [];

    let currentText = '';
    let i = 0;

    while (i < text.length)
    {
        const char = text[i];

        if (char === '<')
        {
            // Find the closing bracket
            const closeIndex = text.indexOf('>', i);

            if (closeIndex === -1)
            {
                // No closing bracket - treat as literal
                currentText += char;
                i++;
                continue;
            }

            const tagContent = text.slice(i + 1, closeIndex);

            // Check if it's a closing tag
            if (tagContent.startsWith('/'))
            {
                const closingTagName = tagContent.slice(1).trim();

                // Check if this closing tag matches the most recent opening tag
                if (tagStack.length > 0 && tagStack[tagStack.length - 1] === closingTagName)
                {
                    // Flush current text with current style
                    if (currentText.length > 0)
                    {
                        runs.push({
                            text: currentText,
                            style: styleStack[styleStack.length - 1]
                        });
                        currentText = '';
                    }

                    // Pop the style and tag stacks
                    styleStack.pop();
                    tagStack.pop();
                    i = closeIndex + 1;
                    continue;
                }
                else
                {
                    // Mismatched closing tag - treat as literal
                    currentText += text.slice(i, closeIndex + 1);
                    i = closeIndex + 1;
                    continue;
                }
            }
            else
            {
                // Opening tag
                const tagName = tagContent.trim();

                // Check if this tag is in tagStyles
                if (tagStyles[tagName])
                {
                    // Flush current text with current style
                    if (currentText.length > 0)
                    {
                        runs.push({
                            text: currentText,
                            style: styleStack[styleStack.length - 1]
                        });
                        currentText = '';
                    }

                    // Create merged style from current style and tag overrides
                    const currentStyle = styleStack[styleStack.length - 1];
                    const mergedStyle = createMergedStyle(currentStyle, tagStyles[tagName]);

                    styleStack.push(mergedStyle);
                    tagStack.push(tagName);
                    i = closeIndex + 1;
                    continue;
                }
                else
                {
                    // Unknown tag - treat as literal
                    currentText += text.slice(i, closeIndex + 1);
                    i = closeIndex + 1;
                    continue;
                }
            }
        }
        else
        {
            currentText += char;
            i++;
        }
    }

    // Flush any remaining text
    if (currentText.length > 0)
    {
        runs.push({
            text: currentText,
            style: styleStack[styleStack.length - 1]
        });
    }

    return runs;
}

/**
 * Extracts plain text from tagged text (strips all tags).
 * Useful for cache keys and debugging.
 * @param text - The tagged text
 * @param style - The TextStyle containing tagStyles
 * @returns Plain text with tags removed
 * @internal
 */
export function getPlainText(text: string, style: TextStyle): string
{
    if (!hasTagStyles(style) || !hasTagMarkup(text))
    {
        return text;
    }

    const runs = parseTaggedText(text, style);

    return runs.map((run) => run.text).join('');
}
