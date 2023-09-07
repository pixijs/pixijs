import type { HTMLTextStyle } from '../../HtmlTextStyle';
import type { HTMLTextRenderData } from '../HTMLTextSystem';

/**
 * takes all the data and returns a svg url string can be loaded by an image element
 * @param text - The text to measure
 * @param style - The style to use
 * @param resolution - The resolution to use
 * @param fontCSS - The font css to use
 * @param htmlTextData - The HTMLTextRenderData to write the SVG to
 * @returns - The SVG as a url string
 */
export function getSVGUrl(
    text: string,
    style: HTMLTextStyle,
    resolution: number,
    fontCSS: string,
    htmlTextData: HTMLTextRenderData
)
{
    const { domElement, styleElement, svgRoot } = htmlTextData;

    domElement.innerHTML = text;
    domElement.setAttribute('style', `transform: scale(${resolution});\n${style.cssStyle}`);
    styleElement.textContent = fontCSS;

    const { width, height } = htmlTextData.image;

    svgRoot.setAttribute('width', width.toString());
    svgRoot.setAttribute('height', height.toString());

    return new XMLSerializer().serializeToString(svgRoot);
}
