/* eslint-disable no-restricted-globals */
import { HTMLTextRenderData } from '../HTMLTextRenderData';

import type { Size } from '../../../maths/misc/Size';
import type { HTMLTextStyle } from '../HTMLTextStyle';

let tempHTMLTextRenderData: HTMLTextRenderData;

/**
 * Measures the HTML text without actually generating an image.
 * This is used to calculate the size of the text.
 * @param text - The text to measure
 * @param style - The style to use
 * @param fontStyleCSS - The font css to use
 * @param htmlTextRenderData - The HTMLTextRenderData to write the SVG to
 * @returns - The size of the text
 * @internal
 */
export function measureHtmlText(
    text: string,
    style: HTMLTextStyle,
    fontStyleCSS?: string,
    htmlTextRenderData?: HTMLTextRenderData
): Size
{
    htmlTextRenderData ||= tempHTMLTextRenderData || (tempHTMLTextRenderData = new HTMLTextRenderData());

    const { domElement, styleElement, svgRoot } = htmlTextRenderData;

    // Set CSS separately via textContent to prevent style tag injection/escape
    // If text contains '</style>', setting it via innerHTML would break out of the style context
    const inlineStyleEl = domElement.querySelector('style') || document.createElement('style');

    inlineStyleEl.textContent = style.cssStyle;
    domElement.innerHTML = `<div style='padding:0'>${text}</div>`;
    domElement.insertBefore(inlineStyleEl, domElement.firstChild);

    domElement.setAttribute('style', 'transform-origin: top left; display: inline-block');

    if (fontStyleCSS)
    {
        styleElement.textContent = fontStyleCSS;
    }

    // Measure the contents using the shadow DOM
    document.body.appendChild(svgRoot);

    // Use scrollWidth/scrollHeight instead of getBoundingClientRect
    // This captures the full content size including any overflow
    // (e.g., when wordWrap is true but long words can't break)
    let contentWidth = domElement.scrollWidth;
    let contentHeight = domElement.scrollHeight;

    svgRoot.remove();

    // Account for drop shadow which extends beyond the layout bounds
    // text-shadow is a visual effect not captured by scrollWidth/scrollHeight
    if (style.dropShadow)
    {
        const { distance, angle, blur } = style.dropShadow;
        const shadowOffsetX = Math.abs(Math.round(Math.cos(angle) * distance));
        const shadowOffsetY = Math.abs(Math.round(Math.sin(angle) * distance));

        contentWidth += shadowOffsetX + blur;
        contentHeight += shadowOffsetY + blur;
    }

    // padding is included in the scroll dimensions, so we need to remove it here
    const doublePadding = style.padding * 2;

    return {
        width: contentWidth - doublePadding,
        height: contentHeight - doublePadding,
    };
}
