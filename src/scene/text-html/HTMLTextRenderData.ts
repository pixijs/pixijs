import { DOMAdapter } from '../../environment/adapter';
import { type ImageLike } from '../../environment/ImageLike';

import type { CanvasAndContext } from '../../rendering/renderers/shared/texture/CanvasPool';

const typeSymbol = Symbol.for('pixijs.HTMLTextRenderData');

/** @internal */
const nssvg = 'http://www.w3.org/2000/svg';
/** @internal */
const nsxhtml = 'http://www.w3.org/1999/xhtml';

/** @internal */
export class HTMLTextRenderData
{
    /**
     * Type symbol used to identify instances of HTMLTextRenderData.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a HTMLTextRenderData.
     * @param obj - The object to check.
     * @returns True if the object is a HTMLTextRenderData, false otherwise.
     */
    public static isHTMLTextRenderData(obj: any): obj is HTMLTextRenderData
    {
        return !!obj && !!obj[typeSymbol];
    }

    public svgRoot = document.createElementNS(nssvg, 'svg');
    public foreignObject = document.createElementNS(nssvg, 'foreignObject');
    public domElement = document.createElementNS(nsxhtml, 'div');
    public styleElement = document.createElementNS(nsxhtml, 'style');
    public image: ImageLike;
    public canvasAndContext?: CanvasAndContext;

    constructor()
    {
        const { foreignObject, svgRoot, styleElement, domElement } = this;
        // Arbitrary max size

        foreignObject.setAttribute('width', '10000');
        foreignObject.setAttribute('height', '10000');
        foreignObject.style.overflow = 'hidden';

        svgRoot.appendChild(foreignObject);

        foreignObject.appendChild(styleElement);
        foreignObject.appendChild(domElement);

        this.image = DOMAdapter.get().createImage();
    }
}
