import { CanvasTextMetrics } from '../../text/canvas/CanvasTextMetrics';
import { HTMLTextRenderData } from '../HTMLTextSystem';

import type { Size } from '../../../maths/misc/Size';
import type { HTMLTextStyle } from '../HtmlTextStyle';

let tempHTMLTextRenderData: HTMLTextRenderData;

/**
 * Measures the HTML text without actually generating an image.
 * This is used to calculate the size of the text.
 * @param text - The text to measure
 * @param style - The style to use
 * @param fontStyleCSS - The font css to use
 * @param htmlTextRenderData - The HTMLTextRenderData to write the SVG to
 * @returns - The size of the text
 */
export function measureHtmlText(
    text: string,
    style: HTMLTextStyle,
    fontStyleCSS?: string,
    htmlTextRenderData?: HTMLTextRenderData
): Size
{
    htmlTextRenderData = htmlTextRenderData || tempHTMLTextRenderData || (tempHTMLTextRenderData = new HTMLTextRenderData());

    const { domElement, styleElement, svgRoot } = htmlTextRenderData;

    domElement.innerHTML = `<style>${style.cssStyle}</style><div>${text}</div>`;

    domElement.setAttribute('style', 'transform-origin: top left; display: inline-block');

    if (fontStyleCSS)
    {
        styleElement.textContent = fontStyleCSS;
    }

    // Measure the contents using the shadow DOM
    document.body.appendChild(svgRoot);

    const contentBounds = domElement.getBoundingClientRect();

    svgRoot.remove();

    const descenderPadding = CanvasTextMetrics.measureFont(style.fontStyle).descent;

    return {
        width: contentBounds.width,
        height: contentBounds.height + descenderPadding,
    };
}
